import { redirect } from "next/navigation";

/** Legacy URL — Tiwa admin uses Supabase Auth at /admin/login */
export default function AdminSignInRedirect({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const params = new URLSearchParams();
  if (searchParams.callbackUrl?.startsWith("/admin")) {
    params.set("redirect", searchParams.callbackUrl);
  }
  if (searchParams.error === "admin-required") {
    params.set("error", "unauthorized");
  }
  const qs = params.toString();
  redirect(qs ? `/admin/login?${qs}` : "/admin/login");
}
