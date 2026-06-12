import { supabaseAdmin } from "@/lib/tiwa/supabase-admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Look up an order by UUID id or human-readable order_number.
 * Do not use PostgREST `.or()` with interpolated order numbers — hyphens in
 * values like `ORD-1739123456-123` break the filter parser.
 */
export async function fetchSupabaseOrderByRef<T extends string>(
  orderRef: string,
  select: T
) {
  const ref = orderRef.trim();

  // Order numbers always start with ORD- — look up by order_number first
  if (ref.startsWith("ORD-")) {
    return supabaseAdmin
      .from("orders")
      .select(select)
      .eq("order_number", ref)
      .maybeSingle();
  }

  if (UUID_RE.test(ref)) {
    const byId = await supabaseAdmin
      .from("orders")
      .select(select)
      .eq("id", ref)
      .maybeSingle();
    if (byId.data) return byId;
  }

  return supabaseAdmin
    .from("orders")
    .select(select)
    .eq("order_number", ref)
    .maybeSingle();
}
