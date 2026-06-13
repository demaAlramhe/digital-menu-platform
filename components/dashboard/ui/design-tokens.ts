/** Shared design tokens for internal dashboard shell (Phase 1+). */
export const tokens = {
  page: {
    background: "bg-stone-50",
    maxWidth: "max-w-6xl",
  },
  card: {
    base: "rounded-2xl border border-stone-200 bg-white shadow-sm",
    padding: "p-5 sm:p-6",
    hover: "transition-shadow hover:shadow-md",
  },
  heading: {
    page: "text-2xl font-bold text-stone-900 tracking-tight",
    section: "text-lg font-semibold text-stone-900",
    label: "text-sm font-medium text-stone-700",
  },
  button: {
    primary:
      "rounded-xl bg-stone-900 text-white px-4 py-2.5 font-semibold hover:bg-stone-800 transition-colors",
    secondary:
      "rounded-xl border border-stone-300 bg-white px-4 py-2.5 font-semibold text-stone-700 hover:bg-stone-50 transition-colors",
    accent:
      "rounded-xl bg-amber-600 text-white px-4 py-2.5 font-semibold hover:bg-amber-700 transition-colors",
  },
  input: {
    base: "rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors",
  },
  badge: {
    base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  },
  sidebar: {
    width: "w-64",
    collapsedWidth: "w-[68px]",
    background: "bg-white border-e border-stone-200",
    item: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    itemActive: "bg-amber-50 text-amber-900",
    itemInactive: "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
  },
} as const;
