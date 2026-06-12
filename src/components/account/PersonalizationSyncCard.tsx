"use client";

import { useState } from "react";
import { Cloud, CloudOff, Loader2, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  getVisitorProfile,
  hasPersonalizationSignals,
} from "@/lib/personalization/profile";
import { useVisitorProfile } from "@/hooks/useVisitorProfile";

export function PersonalizationSyncCard() {
  const { status } = useSession();
  const { profile } = useVisitorProfile();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (status !== "authenticated") return null;

  const signalCount =
    profile.searches.length +
    profile.views.length +
    profile.externalIntents.length +
    profile.declaredInterests.length;

  const handleSyncNow = async () => {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/personalization/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: getVisitorProfile() }),
      });
      if (res.ok) setMessage("Preferences saved to your account.");
      else setMessage("Could not sync right now. Try again shortly.");
    } catch {
      setMessage("Offline — sync when you’re back online.");
    } finally {
      setPending(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Clear saved shopping preferences on all devices?")) return;
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/personalization/sync", { method: "DELETE" });
      if (res.ok) {
        localStorage.removeItem("motchis-visitor-profile");
        window.dispatchEvent(new CustomEvent("motchis-personalization-updated"));
        setMessage("Preferences cleared.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="rounded-2xl border border-blush-200/80 bg-white p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
          <Cloud className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg text-charcoal">
            Shopping preferences
          </h2>
          <p className="mt-1 text-sm text-charcoal-light">
            Searches, interests, and browsing sync to your account so picks follow
            you on phone, tablet, and computer.
          </p>
          <p className="mt-2 text-xs text-charcoal-light">
            {hasPersonalizationSignals()
              ? `${signalCount} saved signal${signalCount === 1 ? "" : "s"} on this device.`
              : "Browse the shop or choose interests to get personalized picks."}
          </p>
          {message ? (
            <p className="mt-2 text-xs font-medium text-primary-700">{message}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Cloud className="h-3.5 w-3.5" />
              )}
              Sync now
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full border border-blush-200 px-4 py-2 text-xs font-medium text-charcoal-light hover:border-red-200 hover:text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-charcoal-light">
            <CloudOff className="h-3 w-3" aria-hidden />
            Guests: preferences stay on this browser only until you sign in
          </p>
        </div>
      </div>
    </section>
  );
}
