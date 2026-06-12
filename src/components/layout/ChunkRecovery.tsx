"use client";

import { useEffect } from "react";
import {
  errorTextFromEvent,
  errorTextFromUnknown,
  isNextStaticChunkTarget,
  recoverFromClientError,
} from "@/lib/chunk-error";

/** Recover from stale webpack chunks after deploys or interrupted dev HMR. */
export function ChunkRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      recoverFromClientError(errorTextFromEvent(event), {
        fromNextChunk: isNextStaticChunkTarget(event.target),
        purgePwa: process.env.NODE_ENV === "production",
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      recoverFromClientError(errorTextFromUnknown(event.reason), {
        purgePwa: process.env.NODE_ENV === "production",
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
