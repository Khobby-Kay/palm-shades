import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/tiwa/supabase-admin";
import { isSupabaseSyncConfigured } from "@/lib/sync/config";
import { minorToMajor } from "@/lib/sync/money";

function mapPaymentStatus(status: string): string {
  const s = status.toUpperCase();
  if (s === "PAID") return "paid";
  if (s === "FAILED") return "failed";
  if (s === "REFUNDED") return "refunded";
  return "pending";
}

function mapOrderStatus(status: string, paymentStatus: string): string {
  const s = status.toUpperCase();
  if (s === "SHIPPED") return "shipped";
  if (s === "DELIVERED") return "delivered";
  if (s === "CANCELLED") return "cancelled";
  if (s === "REFUNDED") return "refunded";
  if (s === "PROCESSING") return "processing";
  if (paymentStatus.toUpperCase() === "PENDING") return "awaiting_payment";
  return "pending";
}

export type SyncOrderExtras = {
  shippingMethod?: "pickup" | "doorstep";
  firstName?: string;
  lastName?: string | null;
  couponCode?: string | null;
};

function addressPayload(
  order: {
    fullName: string;
    phone: string;
    shippingLine1: string;
    shippingLine2: string | null;
    shippingCity: string;
    shippingRegion: string | null;
    shippingCountry: string;
  },
  extras?: SyncOrderExtras
) {
  const [fallbackFirst, ...rest] = order.fullName.trim().split(/\s+/);
  const firstName = extras?.firstName ?? fallbackFirst ?? "";
  const lastName = extras?.lastName ?? rest.join(" ") ?? "";

  return {
    firstName,
    lastName,
    full_name: order.fullName,
    phone: order.phone,
    address: order.shippingLine1,
    line1: order.shippingLine1,
    line2: order.shippingLine2,
    city: order.shippingCity,
    region: order.shippingRegion,
    country: order.shippingCountry,
  };
}

/** Push Prisma order → Supabase so Tiwa admin sees storefront checkouts. */
export async function syncOrderToSupabase(
  prismaOrderId: string,
  extras?: SyncOrderExtras
): Promise<void> {
  if (!isSupabaseSyncConfigured()) return;

  const order = await prisma.order.findUnique({
    where: { id: prismaOrderId },
    include: {
      items: {
        include: {
          product: { select: { supabaseId: true, stock: true } },
          variant: { select: { supabaseId: true, stock: true } },
        },
      },
    },
  });

  if (!order) return;

  const shipping = addressPayload(order, extras);
  const paymentStatus = mapPaymentStatus(order.paymentStatus);
  const status = mapOrderStatus(order.status, order.paymentStatus);
  const paymentMethod =
    order.paymentMethod === "MOOLRE" ? "moolre" : order.paymentMethod?.toLowerCase() ?? "unknown";

  const sbOrder = {
    order_number: order.orderNumber,
    email: order.email,
    phone: order.phone,
    status,
    payment_status: paymentStatus,
    currency: order.currency || "GHS",
    subtotal: minorToMajor(order.subtotal),
    shipping_total: minorToMajor(order.shipping),
    discount_total: minorToMajor(order.discount),
    total: minorToMajor(order.total),
    shipping_method: extras?.shippingMethod ?? "doorstep",
    payment_method: paymentMethod,
    payment_transaction_id: order.moolreReference ?? order.stripePaymentIntentId ?? null,
    notes: order.notes,
    shipping_address: shipping,
    billing_address: shipping,
    metadata: {
      prisma_order_id: order.id,
      payment_method: paymentMethod,
      first_name: shipping.firstName,
      last_name: shipping.lastName,
      coupon_code: extras?.couponCode ?? null,
    },
    updated_at: new Date().toISOString(),
  };

  let sbOrderId = order.supabaseId;

  if (sbOrderId) {
    const { error } = await supabaseAdmin.from("orders").update(sbOrder).eq("id", sbOrderId);
    if (error) {
      throw new Error(`Order sync failed: ${error.message}`);
    }
    await supabaseAdmin.from("order_items").delete().eq("order_id", sbOrderId);
  } else {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({ ...sbOrder, created_at: order.createdAt.toISOString() })
      .select("id")
      .single();

    if (error || !data?.id) {
      throw new Error(`Order sync failed: ${error?.message ?? "no id returned"}`);
    }
    sbOrderId = data.id;
    await prisma.order.update({
      where: { id: order.id },
      data: { supabaseId: sbOrderId },
    });
  }

  const lineRows = order.items.map((it) => ({
    order_id: sbOrderId,
    product_id: it.product.supabaseId,
    variant_id: it.variant?.supabaseId ?? null,
    product_name: it.name,
    variant_name: it.variantName,
    sku: it.variantSku ?? it.productCode,
    quantity: it.quantity,
    unit_price: minorToMajor(it.price),
    total_price: minorToMajor(it.price * it.quantity),
    metadata: { prisma_order_item_id: it.id },
  }));

  const withProduct = lineRows.filter((r) => r.product_id);
  if (withProduct.length > 0) {
    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(withProduct);
    if (itemsErr) console.error("[sync] order_items:", itemsErr.message);
  }

  await syncStockLevelsToSupabase(order.id);
}

/** After checkout, align Supabase product/variant quantities with current Prisma stock. */
export async function syncStockLevelsToSupabase(prismaOrderId: string): Promise<void> {
  if (!isSupabaseSyncConfigured()) return;

  const order = await prisma.order.findUnique({
    where: { id: prismaOrderId },
    include: {
      items: {
        select: { productId: true, variantId: true },
      },
    },
  });
  if (!order) return;

  const seenProducts = new Set<string>();
  const seenVariants = new Set<string>();

  for (const it of order.items) {
    if (it.variantId && !seenVariants.has(it.variantId)) {
      seenVariants.add(it.variantId);
      const v = await prisma.productVariant.findUnique({
        where: { id: it.variantId },
        select: { supabaseId: true, stock: true },
      });
      if (v?.supabaseId) {
        await supabaseAdmin
          .from("product_variants")
          .update({ quantity: v.stock })
          .eq("id", v.supabaseId);
      }
    } else if (!it.variantId && !seenProducts.has(it.productId)) {
      seenProducts.add(it.productId);
      const p = await prisma.product.findUnique({
        where: { id: it.productId },
        select: { supabaseId: true, stock: true },
      });
      if (p?.supabaseId) {
        await supabaseAdmin
          .from("products")
          .update({ quantity: p.stock })
          .eq("id", p.supabaseId);
      }
    }
  }
}

/** Update payment/status on linked Supabase order (webhook / mark paid). */
export async function syncOrderPaymentToSupabase(
  prismaOrderId: string,
  paymentStatus: string,
  orderStatus?: string
): Promise<void> {
  if (!isSupabaseSyncConfigured()) return;

  const order = await prisma.order.findUnique({
    where: { id: prismaOrderId },
    select: { supabaseId: true, paymentStatus: true, status: true },
  });
  if (!order?.supabaseId) {
    await syncOrderToSupabase(prismaOrderId);
    return;
  }

  const pay = mapPaymentStatus(paymentStatus);
  const st = mapOrderStatus(orderStatus ?? order.status, paymentStatus);

  await supabaseAdmin
    .from("orders")
    .update({
      payment_status: pay,
      status: st,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.supabaseId);
}
