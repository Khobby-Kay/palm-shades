"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { brandAssets } from "@/lib/brand-assets";
import type { PwaSettings } from "@/lib/cms/settings";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "motchis-pwa-dismissed";

const DEFAULT_SETTINGS: PwaSettings = {
  showInstallPrompt: true,
  promptTitle: `Add ${siteConfig.shortName} to your home screen`,
  promptBody:
    "Install the app for faster loading and one-tap access to shop and book.",
  themeColor: brandAssets.colors.pink,
};

export function InstallPrompt() {
  const [settings, setSettings] = useState<PwaSettings>(DEFAULT_SETTINGS);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    fetch("/api/storefront/pwa-settings")
      .then((r) => r.json())
      .then((data) => setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!settings.showInstallPrompt) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios =
      /iphone|ipad|ipod/.test(ua) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIos(ios);

    let showTimer: ReturnType<typeof setTimeout> | null = null;

    const reveal = () => {
      showTimer = setTimeout(() => setVisible(true), 2500);
    };

    if (ios) {
      reveal();
      return () => {
        if (showTimer) clearTimeout(showTimer);
      };
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      reveal();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (showTimer) clearTimeout(showTimer);
    };
  }, [settings.showInstallPrompt]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setDeferred(null);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }, [deferred, dismiss]);

  if (!visible || !settings.showInstallPrompt) return null;

  return (
    <div
      role="dialog"
      aria-label={settings.promptTitle}
      className="fixed inset-x-0 top-[calc(2.25rem+env(safe-area-inset-top,0px))] z-[70] border-b border-primary-200/60 bg-white/95 px-4 py-3 shadow-md backdrop-blur-md sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:top-auto"
      style={{ borderColor: `${settings.themeColor}44` }}
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3 pr-8">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${settings.themeColor}33` }}
        >
          <Download className="h-5 w-5 text-primary-700" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-charcoal">{settings.promptTitle}</p>
          <p className="mt-0.5 text-sm text-slate-600">
            {isIos
              ? "Tap Share, then “Add to Home Screen” for quick shop access."
              : settings.promptBody}
          </p>
          {!isIos && deferred ? (
            <button
              type="button"
              onClick={install}
              className="mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal"
              style={{ backgroundColor: settings.themeColor }}
            >
              Add to home screen
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
