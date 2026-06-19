/** Shared design tokens for owner dashboard + super admin (light premium). */
export const dash = {
  shell:
    "relative min-h-screen bg-[linear-gradient(180deg,#f5f4f1_0%,#fafaf9_38%,#ffffff_100%)]",
  page: "relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12",
  card:
    "rounded-2xl border border-brand-secondary/40 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_30px_rgba(15,23,42,0.05)] ring-1 ring-brand-dark/[0.03] backdrop-blur-sm",
  cardHover:
    "rounded-2xl border border-brand-secondary/40 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_30px_rgba(15,23,42,0.05)] ring-1 ring-brand-dark/[0.03] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-secondary/60 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] hover:ring-brand-dark/[0.05]",
  cardInset: "rounded-xl border border-brand-secondary/30 bg-stone-50/70",
  hero:
    "relative overflow-hidden rounded-2xl border border-brand-secondary/40 bg-white/95 p-6 shadow-[0_8px_40px_rgba(15,23,42,0.06)] ring-1 ring-brand-dark/[0.03] sm:p-8",
  statCard:
    "rounded-2xl border border-brand-secondary/40 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_6px_24px_rgba(15,23,42,0.04)] ring-1 ring-brand-dark/[0.03]",
  statLabel: "text-xs font-semibold text-stone-600",
  statValue: "mt-2 text-3xl font-semibold tracking-tight text-brand-dark tabular-nums",
  input:
    "w-full rounded-xl border border-stone-200/90 bg-white px-3.5 py-2.5 text-[15px] text-brand-dark shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)] outline-none transition placeholder:text-stone-400 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20",
  select:
    "w-full rounded-xl border border-stone-200/90 bg-white px-3.5 py-2.5 text-[15px] text-brand-dark shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)] outline-none transition focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20",
  label: "mb-1.5 block text-sm font-medium text-stone-700",
  sectionTitle: "text-base font-semibold tracking-tight text-brand-dark",
  sectionDesc: "mt-1 text-sm leading-relaxed text-stone-500",
  meta: "text-sm text-stone-500",
  eyebrow: "text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400",
  primaryBtn:
    "inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(59,67,80,0.22)] transition hover:bg-brand-dark-hover hover:shadow-[0_6px_20px_rgba(59,67,80,0.28)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
  secondaryBtn:
    "inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-secondary/60 bg-white px-5 py-2.5 text-sm font-semibold text-brand-dark shadow-sm transition hover:border-brand-dark/30 hover:bg-brand-secondary/10 active:scale-[0.98] disabled:opacity-50",
  dangerBtn:
    "inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200/90 bg-red-50/90 px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-100 active:scale-[0.98] disabled:opacity-50",
  ghostBtn:
    "inline-flex min-h-10 items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100/90 hover:text-brand-dark",
  filterChip:
    "inline-flex min-h-10 items-center rounded-xl border border-brand-secondary/60 bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm transition hover:border-brand-dark/30 hover:bg-brand-secondary/10",
  filterChipActive:
    "inline-flex min-h-10 items-center rounded-xl border border-brand-dark bg-brand-dark px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(59,67,80,0.18)]",
  uploadZone:
    "rounded-xl border border-dashed border-brand-secondary/70 bg-gradient-to-b from-stone-50/90 to-white p-4 sm:p-5",
  priceBadge:
    "inline-flex rounded-full bg-brand-dark px-3 py-1 text-sm font-bold tabular-nums text-white shadow-sm",
  navBrand: "text-sm font-semibold tracking-tight text-brand-dark sm:text-[15px]",
  navLink:
    "rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100/90 hover:text-brand-dark",
  navLinkActive:
    "rounded-xl bg-brand-dark px-3 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(59,67,80,0.15)]",
  navMobileLink:
    "rounded-xl bg-stone-50 px-3 py-3 text-center text-sm font-medium text-stone-700 transition hover:bg-stone-100",
  navMobileLinkActive:
    "rounded-xl bg-brand-dark px-3 py-3 text-center text-sm font-semibold text-white shadow-sm",
} as const;
