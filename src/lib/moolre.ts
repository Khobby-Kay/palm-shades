/**
 * Moolre payment gateway — hosted payment links & status checks.
 * @see https://docs.moolre.com/
 */

export type MoolreApiResponse<T = unknown> = {
  status: number;
  code: string;
  message: string;
  data: T;
  go?: unknown;
};

export type MoolrePaymentLinkData = {
  authorization_url: string;
  reference: string;
};

export type MoolrePaymentStatusData = {
  txstatus: number;
  externalref?: string;
  transactionid?: string;
  amount?: string;
};

function readConfig() {
  const apiUser = process.env.MOOLRE_API_USER?.trim();
  const accountNumber = process.env.MOOLRE_ACCOUNT_NUMBER?.trim();
  const apiPubKey = process.env.MOOLRE_API_PUBKEY?.trim();
  const apiEmail =
    process.env.MOOLRE_API_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "hello@palmshades.com";
  const sandbox = process.env.MOOLRE_SANDBOX === "true";

  if (!apiUser || !accountNumber) return null;

  const baseUrl = sandbox
    ? "https://sandbox.moolre.com"
    : process.env.MOOLRE_API_URL?.trim() || "https://api.moolre.com";

  return {
    apiUser,
    accountNumber,
    apiPubKey: apiPubKey || "",
    apiEmail,
    baseUrl,
    sandbox,
  };
}

export function isMoolreConfigured(): boolean {
  const cfg = readConfig();
  if (!cfg) return false;
  // Live requires public key; sandbox only needs username per Moolre docs.
  if (cfg.sandbox) return true;
  return cfg.apiPubKey.length > 0;
}

export type MoolreSetupStatus = {
  configured: boolean;
  sandbox: boolean;
  missing: string[];
  callbackUrl: string;
  hasApiUser: boolean;
  hasAccountNumber: boolean;
  hasPubKey: boolean;
};

/** For admin dashboard — which env vars are set (never exposes secrets). */
export function getMoolreSetupStatus(): MoolreSetupStatus {
  const apiUser = !!process.env.MOOLRE_API_USER?.trim();
  const accountNumber = !!process.env.MOOLRE_ACCOUNT_NUMBER?.trim();
  const apiPubKey = !!process.env.MOOLRE_API_PUBKEY?.trim();
  const sandbox = process.env.MOOLRE_SANDBOX === "true";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  const callbackUrl =
    process.env.MOOLRE_CALLBACK_URL?.trim() ||
    `${siteUrl.replace(/\/$/, "")}/api/webhooks/moolre`;

  const missing: string[] = [];
  if (!apiUser) missing.push("MOOLRE_API_USER");
  if (!accountNumber) missing.push("MOOLRE_ACCOUNT_NUMBER");
  if (!sandbox && !apiPubKey) missing.push("MOOLRE_API_PUBKEY");

  return {
    configured: isMoolreConfigured(),
    sandbox,
    missing,
    callbackUrl,
    hasApiUser: apiUser,
    hasAccountNumber: accountNumber,
    hasPubKey: apiPubKey,
  };
}

/** Convert pesewas (minor units) to GHS string for Moolre APIs. */
export function toMoolreAmount(pesewas: number): string {
  return (pesewas / 100).toFixed(2);
}

export async function generatePaymentLink(params: {
  amountPesewas: number;
  externalref: string;
  callbackUrl: string;
  redirectUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ authorizationUrl: string; reference: string }> {
  const cfg = readConfig();
  if (!cfg) {
    throw new Error("Moolre is not configured.");
  }

  const body = {
    type: 1,
    amount: toMoolreAmount(params.amountPesewas),
    email: cfg.apiEmail,
    externalref: params.externalref,
    callback: params.callbackUrl,
    redirect: params.redirectUrl,
    reusable: "0",
    currency: "GHS",
    accountnumber: cfg.accountNumber,
    ...(params.metadata ? { metadata: params.metadata } : {}),
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-USER": cfg.apiUser,
  };
  if (cfg.apiPubKey) {
    headers["X-API-PUBKEY"] = cfg.apiPubKey;
  }

  const res = await fetch(`${cfg.baseUrl}/embed/link`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as MoolreApiResponse<MoolrePaymentLinkData>;

  if (!res.ok || json.status !== 1 || !json.data?.authorization_url) {
    const msg = json.message || "Could not create Moolre payment link.";
    throw new Error(msg);
  }

  return {
    authorizationUrl: json.data.authorization_url,
    reference: json.data.reference ?? params.externalref,
  };
}

/** idtype 1 = external reference (our order number). */
export async function getPaymentStatus(
  externalref: string
): Promise<MoolrePaymentStatusData | null> {
  const cfg = readConfig();
  if (!cfg) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-USER": cfg.apiUser,
  };
  if (cfg.apiPubKey) {
    headers["X-API-PUBKEY"] = cfg.apiPubKey;
  }

  const res = await fetch(`${cfg.baseUrl}/open/transact/status`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: 1,
      idtype: 1,
      id: externalref,
      accountnumber: cfg.accountNumber,
    }),
  });

  const json = (await res.json()) as MoolreApiResponse<MoolrePaymentStatusData>;
  if (!res.ok || json.status !== 1) return null;
  return json.data ?? null;
}

export function isMoolrePaymentSuccessful(
  data: MoolrePaymentStatusData | null
): boolean {
  return data?.txstatus === 1;
}
