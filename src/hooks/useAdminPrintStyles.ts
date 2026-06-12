"use client";

import { useEffect } from "react";
import { ADMIN_PRINT_MEDIA_CSS } from "@/lib/admin/print-brand";

const STYLE_ID = "admin-print-styles";

/** Injects shared print CSS so only `.print-section` is visible when printing. */
export function useAdminPrintStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = ADMIN_PRINT_MEDIA_CSS;
    document.head.appendChild(style);

    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);
}
