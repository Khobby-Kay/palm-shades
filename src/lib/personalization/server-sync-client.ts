"use client";

import {
  getVisitorProfile,
  saveVisitorProfile,
} from "@/lib/personalization/profile";
import { mergeVisitorProfiles } from "@/lib/personalization/merge";
import type { VisitorProfile } from "@/lib/personalization/types";
import { parseStoredProfile } from "@/lib/personalization/parse-profile";

const SYNC_DEBOUNCE_MS = 5000;
const FAILURE_BACKOFF_MS = 45000;
const FOCUS_PULL_COOLDOWN_MS = 60000;
const MOBILE_FOCUS_PULL_COOLDOWN_MS = 180000;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pushInFlight: Promise<VisitorProfile | null> | null = null;
let lastSyncFailureAt = 0;
let lastPullAt = 0;

function inFailureBackoff() {
  return Date.now() - lastSyncFailureAt < FAILURE_BACKOFF_MS;
}

/** Pull server profile and merge into local storage. */
export async function pullAndMergePersonalization(): Promise<VisitorProfile | null> {
  if (inFailureBackoff()) return null;

  try {
    const res = await fetch("/api/personalization/sync", {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      lastSyncFailureAt = Date.now();
      return null;
    }

    const data = (await res.json()) as { profile?: unknown; degraded?: boolean };
    if (data.degraded) {
      lastSyncFailureAt = Date.now();
      return null;
    }
    const remote = parseStoredProfile(data.profile);
    if (!remote) return null;

    const merged = mergeVisitorProfiles(getVisitorProfile(), remote);
    saveVisitorProfile(merged);
    lastSyncFailureAt = 0;
    lastPullAt = Date.now();
    return merged;
  } catch {
    lastSyncFailureAt = Date.now();
    return null;
  }
}

/** Push local profile to server (merge server-side) and apply response locally. */
export async function pushPersonalizationToServer(): Promise<VisitorProfile | null> {
  if (inFailureBackoff()) return null;
  if (pushInFlight) return pushInFlight;

  pushInFlight = (async () => {
    try {
      const local = getVisitorProfile();
      const res = await fetch("/api/personalization/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: local }),
      });
      if (!res.ok) {
        lastSyncFailureAt = Date.now();
        return null;
      }

      const data = (await res.json()) as { profile?: unknown; degraded?: boolean };
      if (data.degraded) {
        lastSyncFailureAt = Date.now();
        return null;
      }
      const merged = parseStoredProfile(data.profile);
      if (merged) saveVisitorProfile(merged);
      lastSyncFailureAt = 0;
      return merged;
    } catch {
      lastSyncFailureAt = Date.now();
      return null;
    } finally {
      pushInFlight = null;
    }
  })();

  return pushInFlight;
}

/** Debounced upload after local profile changes (search, view, cart, etc.). */
export function scheduleServerPersonalizationSync(): void {
  if (inFailureBackoff()) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void pushPersonalizationToServer();
  }, SYNC_DEBOUNCE_MS);
}

/** Full login / device handoff: pull remote, merge, then push united profile. */
export async function syncPersonalizationOnLogin(): Promise<void> {
  lastSyncFailureAt = 0;
  await pullAndMergePersonalization();
  await pushPersonalizationToServer();
}

export function shouldPullOnFocus(): boolean {
  if (inFailureBackoff()) return false;
  const now = Date.now();
  const cooldown =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches
      ? MOBILE_FOCUS_PULL_COOLDOWN_MS
      : FOCUS_PULL_COOLDOWN_MS;
  if (now - lastPullAt < cooldown) return false;
  lastPullAt = now;
  return true;
}
