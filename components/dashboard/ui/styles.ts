/** Shared Tailwind class strings for the store-owner dashboard. */
export const dash = {
  page: "mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10",
  card: "rounded-2xl border border-stone-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] ring-1 ring-stone-200/40",
  cardHover:
    "rounded-2xl border border-stone-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] ring-1 ring-stone-200/40 transition hover:border-stone-300 hover:shadow-[0_8px_32px_rgba(15,23,42,0.08)]",
  input:
    "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-[15px] text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-900/10",
  select:
    "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-[15px] text-stone-900 shadow-sm outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-900/10",
  label: "mb-1.5 block text-sm font-medium text-stone-700",
  sectionTitle: "text-base font-semibold tracking-tight text-stone-900",
  sectionDesc: "mt-1 text-sm text-stone-500",
  meta: "text-sm text-stone-500",
  primaryBtn:
    "inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
  secondaryBtn:
    "inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 active:scale-[0.98] disabled:opacity-50",
  dangerBtn:
    "inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 active:scale-[0.98] disabled:opacity-50",
  ghostBtn:
    "inline-flex min-h-10 items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900",
} as const;
