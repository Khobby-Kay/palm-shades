import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/order-payment";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook receiver.
 *
 * Configure locally with the Stripe CLI:
 *   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
 *
 * Copy the printed signing secret into your .env as STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  if (process.env.NODE_ENV === "production" && (!secret || !signature)) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 401 });
  }

  let event: Stripe.Event;
  try {
    if (secret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, secret);
    } else if (process.env.NODE_ENV !== "production") {
      event = JSON.parse(body) as Stripe.Event;
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          if (typeof session.payment_intent === "string") {
            await prisma.order.update({
              where: { id: orderId },
              data: { stripePaymentIntentId: session.payment_intent },
            });
          }
          await markOrderPaid(orderId);
        }
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: "FAILED", status: "CANCELLED" },
          });
        }
        break;
      }
      default:
        // Ignore other event types — we'll handle them as needed.
        break;
    }
  } catch (err) {
    console.error("Webhook handler error", err);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
