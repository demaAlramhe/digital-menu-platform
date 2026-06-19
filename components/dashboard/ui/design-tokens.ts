/** Shared design tokens for internal dashboard shell (Phase 1+). */
export const tokens = {
  page: {
    background: "bg-stone-50",
    maxWidth: "max-w-6xl",
  },
  card: {
    base: "rounded-2xl border border-brand-secondary/40 bg-white shadow-sm",
    padding: "p-5 sm:p-6",
    hover: "transition-shadow hover:shadow-md",
  },
  heading: {
    page: "text-2xl font-bold text-brand-dark tracking-tight",
    section: "text-lg font-semibold text-brand-dark",
    label: "text-sm font-medium text-stone-700",
  },
  button: {
    primary:
      "rounded-xl bg-brand-dark text-white px-4 py-2.5 font-semibold hover:bg-brand-dark-hover transition-colors",
    secondary:
      "rounded-xl border border-brand-secondary/60 bg-white px-4 py-2.5 font-semibold text-brand-dark hover:border-brand-dark/30 hover:bg-brand-secondary/10 transition-colors",
    accent:
      "rounded-xl bg-brand-dark text-white px-4 py-2.5 font-semibold hover:bg-brand-dark-hover transition-colors",
  },
  input: {
    base: "rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-brand-dark placeholder:text-stone-400 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20 transition-colors",
  },
  badge: {
    base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  },
  sidebar: {
    width: "w-64",
    collapsedWidth: "w-[68px]",
    background: "bg-white border-e border-brand-secondary/40",
    item: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors border-s-[3px]",
    itemActive: "bg-brand-dark/8 text-brand-dark border-brand-dark",
    itemInactive:
      "border-transparent text-stone-600 hover:bg-brand-secondary/20 hover:text-brand-dark",
  },
} as const;
