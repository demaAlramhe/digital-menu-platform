import Link from "next/link";
import { TrustSection } from "@/components/home/trust-section";
import { SiteHeader } from "@/components/i18n/site-header";
import { getTranslations } from "@/lib/i18n/server";

const FEATURE_ICONS = [
  GlobeIcon,
  QrIcon,
  RefreshIcon,
  ChatIcon,
  TagIcon,
  PhoneIcon,
] as const;

export default async function HomePage() {
  const { dict } = await getTranslations();

  const benefits = [
    { title: dict.home.benefit1Title, description: dict.home.benefit1Desc },
    { title: dict.home.benefit2Title, description: dict.home.benefit2Desc },
    { title: dict.home.benefit3Title, description: dict.home.benefit3Desc },
    { title: dict.home.benefit4Title, description: dict.home.benefit4Desc },
    { title: dict.home.benefit5Title, description: dict.home.benefit5Desc },
    { title: dict.home.benefit6Title, description: dict.home.benefit6Desc },
  ];

  const steps = [
    { step: "1", title: dict.home.step1Title, description: dict.home.step1Desc },
    { step: "2", title: dict.home.step2Title, description: dict.home.step2Desc },
    { step: "3", title: dict.home.step3Title, description: dict.home.step3Desc },
  ];

  const highlights = [
    dict.home.heroHighlight1,
    dict.home.heroHighlight2,
    dict.home.heroHighlight3,
  ];

  const includedItems = [
    dict.home.included1,
    dict.home.included2,
    dict.home.included3,
    dict.home.included4,
    dict.home.included5,
    dict.home.included6,
    dict.home.included7,
    dict.home.included8,
    dict.home.included9,
    dict.home.included10,
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-amber-50/40 to-slate-50">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,169,98,0.12),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-flex items-center rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-900 ring-1 ring-amber-200/80">
              {dict.home.badge}
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
              <span className="block">{dict.home.headlineLine1}</span>
              <span className="block">{dict.home.headlineLine2}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
              {dict.home.subheadline}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-8 text-base font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 active:scale-[0.98] sm:w-auto"
              >
                {dict.hero.getStarted}
              </Link>
              <Link
                href="/pricing"
                className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-8 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] sm:w-auto"
              >
                {dict.hero.viewPricing}
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm sm:text-sm"
                >
                  <span className="text-amber-600" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
              {dict.home.benefitsTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {dict.home.benefitsSubtitle}
            </p>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {benefits.map((benefit, index) => {
              const Icon = FEATURE_ICONS[index] ?? GlobeIcon;
              return (
                <li
                  key={benefit.title}
                  className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-7"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-100 transition group-hover:bg-amber-100">
                    <Icon />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                    {benefit.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <TrustSection dict={dict} />

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-y border-slate-200/80 bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
              {dict.home.howTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {dict.home.howSubtitle}
            </p>
          </div>

          <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {steps.map((item) => (
              <li
                key={item.step}
                className="relative rounded-2xl border border-slate-100 bg-slate-50/80 p-6 text-center md:text-start"
              >
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white shadow-sm"
                  aria-hidden
                >
                  {item.step}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
              {dict.home.includedTitle}
            </h2>
          </div>

          <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 sm:gap-4">
            {includedItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 text-[15px] text-slate-700 shadow-sm"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
                  aria-hidden
                >
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl bg-slate-900 px-6 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.2)] sm:px-12 sm:py-16">
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              {dict.home.ctaFinalTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {dict.home.ctaFinalDesc}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 active:scale-[0.98] sm:w-auto"
              >
                {dict.home.ctaPricing}
              </Link>
              <Link
                href="/auth/login"
                className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-600 px-8 text-base font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] sm:w-auto"
              >
                {dict.home.ctaLogin}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>{dict.home.footer}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pricing" className="hover:text-slate-800">
              {dict.nav.plans}
            </Link>
            <Link href="/request" className="hover:text-slate-800">
              {dict.nav.requestService}
            </Link>
            <Link href="/auth/login" className="hover:text-slate-800">
              {dict.common.login}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 4.5 7 4.5 9S15 18 12 21 7.5 15 7.5 12 9 6 12 3" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M14 14h2v2h-2zM18 14h2v6h-2zM14 18h2v2h-2z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
      <path d="M4 12a8 8 0 0 1 13.5-5.7M20 7v4h-4M20 12a8 8 0 0 1-13.5 5.7M4 17v-4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
      <path d="M7 18l-4 2 1.5-4.5A9 9 0 1 1 12 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
      <path d="M4 12l8-8 8 8-8 8-8-8z" />
      <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
      <path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5L17.5 13 22 14.5V18a2 2 0 0 1-2 2C9 20 4 15 4 6.5A2 2 0 0 1 6.5 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
