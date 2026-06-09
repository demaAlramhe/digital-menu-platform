"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "pwa-install-banner-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    if (window.innerWidth >= 768) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 px-4"
      role="region"
      aria-label="Install app"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3 rounded-xl border border-[#d4b87a]/40 bg-[rgba(12,10,8,0.92)] px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <button
          type="button"
          onClick={handleInstall}
          className="min-w-0 flex-1 text-start text-sm leading-snug text-[#f5e6c8]"
        >
          📱 Add to home screen for quick access
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-[#d4b87a]/80 transition hover:bg-white/5 hover:text-[#f5e6c8]"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
