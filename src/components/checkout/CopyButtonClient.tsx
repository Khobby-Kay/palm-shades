"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButtonClient({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard not available */
        }
      }}
      aria-label={`Copy ${value}`}
      className="grid h-7 w-7 place-items-center rounded-full text-charcoal-light transition-colors hover:bg-white hover:text-primary-700"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary-700" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
