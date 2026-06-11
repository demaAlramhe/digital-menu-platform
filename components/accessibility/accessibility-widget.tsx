"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  applyAccessibilitySettings,
  loadAccessibilitySettings,
  saveAccessibilitySettings,
} from "@/lib/accessibility/settings";
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  FONT_SCALE_STEP,
  MAX_FONT_SCALE,
  MIN_FONT_SCALE,
  type AccessibilitySettings,
} from "@/lib/accessibility/types";

export function AccessibilityWidget() {
  const { dict, dir } = useLocale();
  const pathname = usePathname();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(
    DEFAULT_ACCESSIBILITY_SETTINGS
  );
  const [ready, setReady] = useState(false);

  const isMenuPage = Boolean(pathname?.includes("/menu"));

  useEffect(() => {
    const loaded = loadAccessibilitySettings();
    setSettings(loaded);
    applyAccessibilitySettings(loaded);
    setReady(true);
  }, []);

  const persist = useCallback((next: AccessibilitySettings) => {
    setSettings(next);
    applyAccessibilitySettings(next);
    saveAccessibilitySettings(next);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  function increaseText() {
    persist({
      ...settings,
      fontScale: Math.min(MAX_FONT_SCALE, settings.fontScale + FONT_SCALE_STEP),
    });
  }

  function decreaseText() {
    persist({
      ...settings,
      fontScale: Math.max(MIN_FONT_SCALE, settings.fontScale - FONT_SCALE_STEP),
    });
  }

  function resetText() {
    persist({ ...settings, fontScale: 1 });
  }

  function toggle(key: keyof Omit<AccessibilitySettings, "fontScale">) {
    persist({ ...settings, [key]: !settings[key] });
  }

  function resetAll() {
    persist(DEFAULT_ACCESSIBILITY_SETTINGS);
  }

  // Menu: WhatsApp FAB is always physical left — keep widget on physical right, elevated.
  const positionClass = isMenuPage
    ? "right-4 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+5.75rem)] sm:right-5"
    : "end-4 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:end-5";

  if (!ready) return null;

  const toggleOptions: Array<{
    key: keyof Omit<AccessibilitySettings, "fontScale">;
    label: string;
    active: boolean;
  }> = [
    { key: "highContrast", label: dict.accessibility.highContrast, active: settings.highContrast },
    { key: "darkContrast", label: dict.accessibility.darkContrast, active: settings.darkContrast },
    { key: "grayscale", label: dict.accessibility.grayscale, active: settings.grayscale },
    { key: "highlightLinks", label: dict.accessibility.highlightLinks, active: settings.highlightLinks },
    { key: "bigCursor", label: dict.accessibility.bigCursor, active: settings.bigCursor },
    { key: "reduceMotion", label: dict.accessibility.pauseAnimations, active: settings.reduceMotion },
    { key: "readableFont", label: dict.accessibility.readableFont, active: settings.readableFont },
    { key: "underlineLinks", label: dict.accessibility.underlineLinks, active: settings.underlineLinks },
  ];

  return (
    <div
      className={`a11y-widget-root fixed z-[90] ${positionClass} flex flex-col items-end gap-2`}
      dir={dir}
    >
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label={dict.accessibility.title}
          className="a11y-panel-enter w-[min(100vw-2rem,20rem)] rounded-2xl border border-stone-200/90 bg-white/95 p-4 shadow-[0_16px_48px_rgba(15,23,42,0.18)] backdrop-blur-md"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-stone-900">
              {dict.accessibility.title}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              aria-label={dict.accessibility.close}
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                {dict.accessibility.textSize}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <PanelButton onClick={decreaseText} label={dict.accessibility.decreaseText} />
                <PanelButton
                  onClick={resetText}
                  label={dict.accessibility.resetTextSize}
                  variant="muted"
                />
                <PanelButton onClick={increaseText} label={dict.accessibility.increaseText} />
              </div>
            </div>

            <ul className="space-y-1.5" role="list">
              {toggleOptions.map((option) => (
                <li key={option.key}>
                  <ToggleRow
                    label={option.label}
                    pressed={option.active}
                    onClick={() => toggle(option.key)}
                  />
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={resetAll}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              {dict.accessibility.resetAll}
            </button>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={dict.accessibility.openMenu}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-200/90 bg-white/95 text-slate-800 shadow-[0_8px_28px_rgba(15,23,42,0.15)] backdrop-blur-md transition hover:border-slate-300 hover:bg-white hover:shadow-[0_12px_32px_rgba(15,23,42,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:scale-[0.97]"
      >
        <AccessibilityIcon />
      </button>
    </div>
  );
}

function PanelButton({
  label,
  onClick,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "muted";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-2 py-2 text-xs font-semibold leading-tight transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
        variant === "muted"
          ? "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
          : "border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-start text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
        pressed
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-stone-200 bg-white text-stone-800 hover:bg-stone-50"
      }`}
    >
      <span>{label}</span>
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          pressed ? "bg-emerald-400" : "bg-stone-300"
        }`}
        aria-hidden
      />
    </button>
  );
}

function AccessibilityIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-1.2 6.2 1.2-.4 1.2.4-5.4 1.8a1 1 0 0 0-.7 1.1l.6 4.2-.9 5.4a1 1 0 0 0 1.7.9L12 18.5l2.5 2.5a1 1 0 0 0 1.7-.9l-.9-5.4.6-4.2a1 1 0 0 0-.7-1.1L10.8 8.2Z" />
    </svg>
  );
}
