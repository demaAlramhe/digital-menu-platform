import type { CSSProperties } from "react";

export const STOREFRONT_GOLD = "#C9A962";
export const STOREFRONT_GOLD_LIGHT = "#E8D5A8";
export const STOREFRONT_GOLD_DARK = "#9A7B3C";
export const STOREFRONT_BG = "#0c0b0a";

export const premiumGlassPanelStyle: CSSProperties = {
  background: "rgba(12, 10, 8, 0.52)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${STOREFRONT_GOLD}`,
  boxShadow:
    "0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,169,98,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
};

export const premiumGlassTileStyle: CSSProperties = {
  background: "rgba(12, 10, 8, 0.45)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: `1px solid rgba(201, 169, 98, 0.45)`,
  boxShadow:
    "0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
};

export const premiumGoldCtaStyle: CSSProperties = {
  background: `linear-gradient(180deg, ${STOREFRONT_GOLD} 0%, ${STOREFRONT_GOLD_DARK} 100%)`,
  color: "#1a1408",
  boxShadow:
    "0 8px 24px rgba(201,169,98,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
};

export function resolveStoreBackgroundUrl(
  ...urls: Array<string | null | undefined>
): string | null {
  for (const url of urls) {
    const trimmed = url?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}
