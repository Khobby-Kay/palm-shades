export type MoolreOrderInput = {
  orderNumber: string;
  total: number;
  email: string;
  customerEmail?: string;
  paymentStatus?: string;
};

export type MoolrePaymentResult =
  | { success: true; url: string; reference?: string }
  | { success: false; message: string; status?: number };

function paymentBaseUrl(requestOrigin?: string): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    requestOrigin ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export async function initiateMoolrePayment(
  order: MoolreOrderInput,
  requestOrigin?: string
): Promise<MoolrePaymentResult> {
  if (!process.env.MOOLRE_API_USER || !process.env.MOOLRE_API_PUBKEY) {
    return { success: false, message: "Payment gateway configuration error" };
  }
  if (!process.env.MOOLRE_ACCOUNT_NUMBER) {
    return { success: false, message: "Payment gateway configuration error" };
  }

  if (order.paymentStatus === "paid") {
    return { success: false, message: "Order is already paid" };
  }

  const amount = Number(order.total);
  if (!amount || amount <= 0) {
    return { success: false, message: "Invalid order amount" };
  }

  const orderRef = order.orderNumber;
  const baseUrl = paymentBaseUrl(requestOrigin);
  const uniqueRef = `${orderRef}-R${Date.now()}`;

  const payload = {
    type: 1,
    amount: amount.toString(),
    email:
      process.env.MOOLRE_MERCHANT_EMAIL ||
      process.env.MOOLRE_API_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "",
    externalref: uniqueRef,
    callback: `${baseUrl}/api/payment/moolre/callback`,
    redirect: `${baseUrl}/order-success?order=${orderRef}&payment_success=true`,
    reusable: "0",
    currency: "GHS",
    accountnumber: process.env.MOOLRE_ACCOUNT_NUMBER,
    metadata: {
      customer_email: order.customerEmail || order.email,
      original_order_number: orderRef,
    },
  };

  console.log(
    "[Payment] Initiating for order:",
    orderRef,
    "| Amount:",
    amount,
    "| Callback:",
    payload.callback
  );

  const response = await fetch("https://api.moolre.com/embed/link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-USER": process.env.MOOLRE_API_USER,
      "X-API-PUBKEY": process.env.MOOLRE_API_PUBKEY,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log(
    "[Payment] Response status:",
    result.status,
    "| Has URL:",
    !!result.data?.authorization_url
  );

  if (result.status === 1 && result.data?.authorization_url) {
    return {
      success: true,
      url: result.data.authorization_url,
      reference: result.data.reference,
    };
  }

  return {
    success: false,
    message: result.message || "Failed to generate payment link",
    status: response.status,
  };
}
