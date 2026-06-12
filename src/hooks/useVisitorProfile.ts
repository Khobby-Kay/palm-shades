"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVisitorProfile } from "@/lib/personalization/profile";
import { EMPTY_PROFILE, type VisitorProfile } from "@/lib/personalization/types";

function profileHasSignals(profile: VisitorProfile): boolean {
  return (
    profile.searches.length > 0 ||
    profile.views.length > 0 ||
    Object.keys(profile.categories).length > 0 ||
    profile.cartProductIds.length > 0 ||
    profile.wishlistProductIds.length > 0 ||
    profile.externalIntents.length > 0 ||
    profile.declaredInterests.length > 0
  );
}

export function useVisitorProfile() {
  const [profile, setProfile] = useState<VisitorProfile>(EMPTY_PROFILE);

  const refresh = useCallback(() => {
    setProfile(getVisitorProfile());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("motchis-personalization-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("motchis-personalization-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const hasSignals = useMemo(() => profileHasSignals(profile), [profile]);

  return {
    profile,
    hasSignals,
    refresh,
  };
}
