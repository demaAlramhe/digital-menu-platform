import Link from "next/link";
import { BelAfiaLogo } from "@/components/marketing/bel-afia-logo";
import { TrustSection } from "@/components/home/trust-section";
import { SiteHeader } from "@/components/i18n/site-header";
import { HeroMenuMockup } from "@/components/marketing/hero-menu-mockup";
import { getTranslations } from "@/lib/i18n/server";
import { buildWhatsAppUrl, getBusinessWhatsAppNumber } from "@/lib/utils/whatsapp";

const FEATURE_ICONS = [
  GlobeIcon,
  QrIcon,
  RefreshIcon,
  ChatIcon,
  TagIcon,
  PhoneIcon,
] as const;

const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2";

export default async function HomePage() {
  const { locale, dict } = await getTranslations();
  const footerWhatsAppUrl = buildWhatsAppUrl(getBusinessWhatsAppNumber());

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

  const footerCopyright =
    locale === "ar"
      ? "© 2026 Bel Afia — QR Menu. جميع الحقوق محفوظة."
      : locale === "he"
        ? "© 2026 Bel Afia — QR Menu. כל הזכויות שמורות."
        : "© 2026 Bel Afia — QR Menu. All rights reserved.";

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brand-secondary/40 bg-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,67,80,0.06),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="w-full max-w-2xl lg:flex-1">
              <p className="mb-5 inline-flex items-center rounded-full bg-brand-secondary/30 px-4 py-1.5 text-sm font-semibold text-brand-dark ring-1 ring-brand-secondary/50">
                {dict.home.badge}
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-brand-dark sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
                <span className="block">{dict.home.headlineLine1}</span>
                <span className="block">{dict.home.headlineLine2}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6b7280] sm:text-xl">
                {dict.home.subheadline}
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/request"
                  className={`flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-dark px-8 text-base font-semibold text-white shadow-[0_8px_24px_rgba(59,67,80,0.22)] transition hover:bg-brand-dark-hover active:scale-[0.98] sm:w-auto ${linkFocus}`}
                >
                  {dict.hero.getStarted}
                </Link>
                <Link
                  href="/pricing"
                  className={`flex min-h-12 w-full items-center justify-center rounded-xl border border-brand-dark bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition hover:bg-brand-dark/5 active:scale-[0.98] sm:w-auto ${linkFocus}`}
                >
                  {dict.hero.viewPricing}
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-secondary/50 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-brand-dark shadow-sm sm:text-sm"
                  >
                    <span className="text-[#15803d]" aria-hidden>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full shrink-0 lg:w-auto">
              <HeroMenuMockup
                imageSrc="/images/hero-menu.jpeg"
                ariaLabel={dict.home.mockupAriaLabel}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="scroll-mt-20 bg-brand-bg py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-brand-dark sm:text-3xl lg:text-4xl">
              {dict.home.benefitsTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#6b7280] sm:text-lg">
              {dict.home.benefitsSubtitle}
            </p>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {benefits.map((benefit, index) => {
              const Icon = FEATURE_ICONS[index] ?? GlobeIcon;
              return (
                <li
                  key={benefit.title}
                  className="group rounded-2xl border border-brand-secondary/40 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-secondary/70 hover:shadow-md sm:p-7"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-secondary/30 text-brand-dark ring-1 ring-brand-secondary/50 transition group-hover:bg-brand-secondary/40">
                    <Icon />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-brand-dark">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
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
        className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-brand-dark sm:text-3xl lg:text-4xl">
              {dict.home.howTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#6b7280] sm:text-lg">
              {dict.home.howSubtitle}
            </p>
          </div>

          <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {steps.map((item) => (
              <li
                key={item.step}
                className="relative rounded-2xl border border-brand-secondary/40 bg-white p-6 text-center shadow-sm md:text-start"
              >
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark text-base font-bold text-white shadow-sm"
                  aria-hidden
                >
                  {item.step}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-brand-dark">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What's included */}
      <section className="bg-brand-bg py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-brand-dark sm:text-3xl lg:text-4xl">
              {dict.home.includedTitle}
            </h2>
          </div>

          <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 sm:gap-4">
            {includedItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-brand-secondary/40 bg-white px-4 py-3.5 text-[15px] text-brand-dark shadow-sm"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#15803d]/10 text-xs font-bold text-[#15803d] ring-1 ring-[#15803d]/20"
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
      <section className="bg-brand-bg pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl bg-brand-dark px-6 py-12 text-center shadow-[0_20px_60px_rgba(59,67,80,0.25)] sm:px-12 sm:py-16">
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              {dict.home.ctaFinalTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#f5f5f4]/80 sm:text-lg">
              {dict.home.ctaFinalDesc}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/request"
                className={`flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition hover:bg-[#f5f5f4] active:scale-[0.98] sm:w-auto ${linkFocus}`}
              >
                {dict.hero.getStarted}
              </Link>
              <Link
                href="/pricing"
                className={`flex min-h-12 w-full items-center justify-center rounded-xl border border-white/35 px-8 text-base font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:w-auto ${linkFocus}`}
              >
                {dict.hero.viewPricing}
              </Link>
            </div>
            <p className="mt-6 text-sm text-[#f5f5f4]/65">
              {dict.home.ctaLoginPrompt}{" "}
              <Link
                href="/auth/login"
                className={`font-medium text-white underline-offset-2 hover:underline ${linkFocus} rounded-sm`}
              >
                {dict.home.ctaLogin}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-brand-secondary/40 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center gap-6 text-center sm:gap-8">
            <BelAfiaLogo variant="compact" className="h-9 w-9" />

            <p className="max-w-xl text-sm leading-relaxed text-[#6b7280]">
              {dict.home.footer}
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
              <nav
                className="flex flex-wrap justify-center gap-4 text-sm text-[#6b7280]"
                aria-label={dict.nav.site}
              >
                <Link
                  href="/pricing"
                  className={`hover:text-brand-dark ${linkFocus} rounded-sm`}
                >
                  {dict.nav.plans}
                </Link>
                <Link
                  href="/request"
                  className={`hover:text-brand-dark ${linkFocus} rounded-sm`}
                >
                  {dict.nav.requestService}
                </Link>
                <Link
                  href="/auth/login"
                  className={`hover:text-brand-dark ${linkFocus} rounded-sm`}
                >
                  {dict.common.login}
                </Link>
              </nav>
              {footerWhatsAppUrl ? (
                <a
                  href={footerWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-medium text-[#15803d] hover:text-[#166534] ${linkFocus} rounded-sm`}
                >
                  {dict.home.footerContact}
                </a>
              ) : (
                <span className="text-sm text-[#6b7280]">{dict.home.footerContact}</span>
              )}
            </div>

            <p className="text-xs text-[#6b7280]">{footerCopyright}</p>
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
