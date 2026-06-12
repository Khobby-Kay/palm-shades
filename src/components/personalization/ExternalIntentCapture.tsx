"use client";

import { useEffect } from "react";
import { captureExternalIntentOncePerSession } from "@/lib/personalization/profile";

/** Records referrer + campaign URL signals once per browser session. */
export function ExternalIntentCapture() {
  useEffect(() => {
    captureExternalIntentOncePerSession();
  }, []);
  return null;
}
