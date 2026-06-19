import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { marketingLinkFocus } from "@/components/marketing/marketing-form-styles";
import { SiteHeader } from "@/components/i18n/site-header";
import { getDirection } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";

const SIZE_TIER_IDS = ["small", "medium", "large"] as const;

const SIZE_TIER_HIGHLIGHT: Record<(typeof SIZE_TIER_IDS)[number], boolean> = {
  small: false,
  medium: true,
  large: false,
};

export default async function PricingPage() {
  const { locale, dict } = await getTranslations();
  const dir = getDirection(locale);
  const { pricing } = dict;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark">
      <SiteHeader />

      <main dir={dir} lang={locale} className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <header className="mb-12 text-center sm:mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
              Bel Afia
            </p>
            <h1 className="mt-3 text-3xl font-bold text-brand-dark sm:text-4xl">
              {pricing.heroTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[#6b7280] sm:text-lg">
              {pricing.heroSubtitle}
            </p>
          </header>

          <section className="mb-14 sm:mb-16">
            <h2 className="text-center text-xl font-bold text-brand-dark sm:text-2xl">
              {pricing.tiersHeading}
            </h2>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {SIZE_TIER_IDS.map((tierId) => {
                const tier = pricing.tiers[tierId];
                const highlight = SIZE_TIER_HIGHLIGHT[tierId];
                const monthlyPlus = pricing.monthlyPlus.replace(
                  "{fee}",
                  pricing.monthlyFee
                );

                return (
                  <article
                    key={tierId}
                    className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm sm:p-7 ${
                      highlight
                        ? "border-2 border-brand-dark shadow-md"
                        : "border-brand-secondary/40"
                    }`}
                  >
                    {highlight && (
                      <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-brand-dark px-3 py-1 text-xs font-bold text-white">
                        {pricing.mostCommon}
                      </span>
                    )}

                    <h3 className="text-xl font-bold text-brand-dark">{tier.name}</h3>
                    <p className="mt-2 text-sm text-[#6b7280]">{tier.itemRange}</p>

                    <p className="mt-5 text-4xl font-bold tracking-tight text-brand-dark">
                      <span dir="ltr" className="inline-block">
                        {tier.setupPrice}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-[#6b7280]">{pricing.oneTimeSetup}</p>
                    <p className="mt-2 text-sm font-medium text-brand-dark">
                      <span dir="ltr" className="inline-block">
                        {monthlyPlus}
                      </span>
                    </p>

                    <Link
                      href={`/request?plan=${tierId}`}
                      className={`mt-8 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition active:scale-[0.98] ${marketingLinkFocus} ${
                        highlight
                          ? "bg-brand-dark text-white hover:bg-brand-dark-hover"
                          : "border border-brand-dark text-brand-dark hover:bg-brand-dark/5"
                      }`}
                    >
                      {pricing.requestCta}
                    </Link>
                  </article>
                );
              })}
            </div>

            <p className="mt-8 text-center text-sm text-[#6b7280]">
              {pricing.largeMenuNote}{" "}
              <Link
                href="/request"
                className={`font-medium text-brand-dark hover:underline ${marketingLinkFocus} rounded-sm`}
              >
                {pricing.requestCta}
              </Link>
            </p>
          </section>

          <section className="mb-14 rounded-2xl border border-brand-secondary/40 bg-white p-6 shadow-sm sm:mb-16 sm:p-8">
            <h2 className="text-center text-xl font-bold text-brand-dark sm:text-2xl">
              {pricing.includedHeading}
            </h2>

            <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 sm:gap-4">
              {pricing.includedFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-xl border border-brand-secondary/40 bg-white px-4 py-3 text-[15px] text-brand-dark shadow-sm"
                >
                  <span className="text-[#15803d]" aria-hidden>
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-14 rounded-2xl border border-brand-secondary/40 bg-white p-6 text-center shadow-sm sm:mb-16 sm:p-8">
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#6b7280]">
              <span dir="ltr" className="inline-block">
                {pricing.monthlyFeeExplanation}
              </span>
            </p>
          </section>

          <section className="rounded-3xl bg-brand-dark px-6 py-10 text-center shadow-[0_20px_60px_rgba(59,67,80,0.25)] sm:px-12 sm:py-12">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {pricing.ctaUnsureTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#f5f5f4]/80 sm:text-base">
              {pricing.ctaUnsureSubtitle}
            </p>
            <Link
              href="/request"
              className={`mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-brand-dark transition hover:bg-[#f5f5f4] active:scale-[0.98] ${marketingLinkFocus}`}
            >
              {pricing.ctaUnsureButton}
            </Link>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
