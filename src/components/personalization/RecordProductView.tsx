"use client";

import { useEffect, useRef } from "react";
import { recordProductView } from "@/lib/personalization/profile";

export function RecordProductView({
  productId,
  slug,
  categorySlug,
}: {
  productId: string;
  slug: string;
  categorySlug: string;
}) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    recordProductView({ productId, slug, categorySlug });
  }, [productId, slug, categorySlug]);

  return null;
}
