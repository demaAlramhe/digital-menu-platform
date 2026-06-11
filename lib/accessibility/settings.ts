import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  type AccessibilitySettings,
} from "./types";

export function loadAccessibilitySettings(): AccessibilitySettings {
  if (typeof window === "undefined") {
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!raw) return DEFAULT_ACCESSIBILITY_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
    return {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      ...parsed,
      fontScale:
        typeof parsed.fontScale === "number"
          ? parsed.fontScale
          : DEFAULT_ACCESSIBILITY_SETTINGS.fontScale,
    };
  } catch {
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }
}

export function saveAccessibilitySettings(settings: AccessibilitySettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ACCESSIBILITY_STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export function applyAccessibilitySettings(settings: AccessibilitySettings): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const body = document.body;

  root.style.setProperty("--a11y-font-scale", String(settings.fontScale));

  root.classList.toggle("a11y-high-contrast", settings.highContrast);
  root.classList.toggle("a11y-dark-contrast", settings.darkContrast);
  root.classList.toggle("a11y-grayscale", settings.grayscale);
  root.classList.toggle("a11y-highlight-links", settings.highlightLinks);
  root.classList.toggle("a11y-big-cursor", settings.bigCursor);
  root.classList.toggle("a11y-reduce-motion", settings.reduceMotion);
  root.classList.toggle("a11y-readable-font", settings.readableFont);
  root.classList.toggle("a11y-underline-links", settings.underlineLinks);

  body.dataset.a11yFontScale = String(settings.fontScale);
}
