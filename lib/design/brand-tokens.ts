/**
 * Bel Afia — marketing / public-site brand tokens (Phase 1).
 *
 * Usage rules:
 * - Page backgrounds: `bg-brand-bg` or `bg-white` (alternate sections for separation).
 * - Primary buttons: `bg-brand-dark text-white hover:bg-brand-dark-hover`.
 * - Secondary buttons: `border border-brand-dark text-brand-dark hover:bg-brand-dark/5`.
 * - Cards: `bg-white border border-brand-secondary/40` — do NOT use `bg-brand-secondary` as card fill.
 * - Badges/pills: `bg-brand-secondary/30 text-brand-dark`.
 * - Focus: `focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2`.
 * - NEVER use `text-brand-secondary` on `bg-brand-bg` — contrast fails WCAG AA.
 */
export const brand = {
  colors: {
    primaryDark: "#3b4350",
    background: "#d7d7d4",
    secondary: "#cac3b9",
    primaryDarkHover: "#2d333d",
    textPrimary: "#3b4350",
    textMuted: "#6b7280",
    textOnDark: "#f5f5f4",
    border: "#cac3b9",
    borderSubtle: "#e5e4e0",
    success: "#15803d",
    warning: "#b45309",
    error: "#b91c1c",
  },
} as const;

export const brandAssets = {
  logo: "/brand/bel-afia-logo-transparent.png",
  logoWithBackground: "/brand/bel-afia-logo.png",
  icon: "/brand/bel-afia-icon.png",
} as const;
