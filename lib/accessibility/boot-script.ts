import { ACCESSIBILITY_STORAGE_KEY } from "./types";

/** Inline script applied in <head> to restore a11y prefs before first paint. */
export function getAccessibilityBootScript(): string {
  const key = JSON.stringify(ACCESSIBILITY_STORAGE_KEY);
  return `(function(){try{var raw=localStorage.getItem(${key});if(!raw)return;var s=JSON.parse(raw);var r=document.documentElement;r.style.setProperty("--a11y-font-scale",String(s.fontScale||1));[["a11y-high-contrast",s.highContrast],["a11y-dark-contrast",s.darkContrast],["a11y-grayscale",s.grayscale],["a11y-highlight-links",s.highlightLinks],["a11y-big-cursor",s.bigCursor],["a11y-reduce-motion",s.reduceMotion],["a11y-readable-font",s.readableFont],["a11y-underline-links",s.underlineLinks]].forEach(function(p){r.classList.toggle(p[0],!!p[1]);});}catch(e){}})();`;
}
