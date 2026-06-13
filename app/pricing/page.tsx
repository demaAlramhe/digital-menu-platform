import Link from "next/link";
import { getDirection } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";
import {
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_LIGHT,
} from "@/lib/storefront/premium-theme";

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
    <main
      dir={dir}
      lang={locale}
      className="min-h-screen bg-stone-900 px-4 py-10 text-white sm:px-6 sm:py-14"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm text-white/55 transition hover:text-white/80"
        >
          ← {dict.store.backToHome}
        </Link>

        {/* 1. Intro */}
        <header className="mb-12 text-center sm:mb-14">
          <p
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: `${STOREFRONT_GOLD}99` }}
          >
            MenuQR
          </p>
          <h1
            className="mt-3 text-3xl font-bold sm:text-4xl"
            style={{ color: STOREFRONT_GOLD_LIGHT }}
          >
            {pricing.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-white/75 sm:text-lg">
            {pricing.heroSubtitle}
          </p>
        </header>

        {/* 2. Size tiers */}
        <section className="mb-14 sm:mb-16">
          <h2
            className="text-center text-xl font-bold sm:text-2xl"
            style={{ color: STOREFRONT_GOLD_LIGHT }}
          >
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
                  className={`relative flex flex-col rounded-2xl border p-6 sm:p-7 ${
                    highlight
                      ? "border-[#C9A962] bg-stone-900/80 shadow-[0_0_0_1px_rgba(201,169,98,0.35),0_20px_60px_rgba(0,0,0,0.45)]"
                      : "border-stone-700 bg-stone-900/60"
                  }`}
                >
                  {highlight && (
                    <span
                      className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-stone-900"
                      style={{ background: STOREFRONT_GOLD }}
                    >
                      {pricing.mostCommon}
                    </span>
                  )}

                  <h3
                    className="text-xl font-bold"
                    style={{ color: STOREFRONT_GOLD_LIGHT }}
                  >
                    {tier.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/65">{tier.itemRange}</p>

                  <p className="mt-5 text-4xl font-bold tracking-tight">
                    <span dir="ltr" className="inline-block">
                      {tier.setupPrice}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {pricing.oneTimeSetup}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/75">
                    <span dir="ltr" className="inline-block">
                      {monthlyPlus}
                    </span>
                  </p>

                  <Link
                    href={`/request?plan=${tierId}`}
                    className={`mt-8 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition active:scale-[0.98] ${
                      highlight
                        ? "text-stone-900 hover:brightness-110"
                        : "border border-[#C9A962]/60 text-[#f5e6c8] hover:border-[#C9A962] hover:bg-[#C9A962]/10"
                    }`}
                    style={
                      highlight
                        ? {
                            background: `linear-gradient(180deg, ${STOREFRONT_GOLD} 0%, #9A7B3C 100%)`,
                          }
                        : undefined
                    }
                  >
                    {pricing.requestCta}
                  </Link>
                </article>
              );
            })}
          </div>

          <p className="mt-8 text-center text-sm text-white/65">
            {pricing.largeMenuNote}{" "}
            <Link
              href="/request"
              className="font-medium text-[#E8D5A8] hover:underline"
            >
              {pricing.requestCta}
            </Link>
          </p>
        </section>

        {/* 3. What's included */}
        <section className="mb-14 rounded-2xl border border-stone-700 bg-stone-900/60 p-6 sm:mb-16 sm:p-8">
          <h2
            className="text-center text-xl font-bold sm:text-2xl"
            style={{ color: STOREFRONT_GOLD_LIGHT }}
          >
            {pricing.includedHeading}
          </h2>

          <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 sm:gap-4">
            {pricing.includedFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 rounded-xl border border-stone-700/80 bg-stone-950/40 px-4 py-3 text-[15px] text-white/85"
              >
                <span style={{ color: STOREFRONT_GOLD }} aria-hidden>
                  ✓
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Monthly fee explanation */}
        <section className="mb-14 text-center sm:mb-16">
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/75">
            <span dir="ltr" className="inline-block">
              {pricing.monthlyFeeExplanation}
            </span>
          </p>
        </section>

        {/* 5. CTA */}
        <section className="rounded-3xl border border-stone-700 bg-stone-900/80 px-6 py-10 text-center sm:px-12 sm:py-12">
          <h2
            className="text-xl font-bold sm:text-2xl"
            style={{ color: STOREFRONT_GOLD_LIGHT }}
          >
            {pricing.ctaUnsureTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {pricing.ctaUnsureSubtitle}
          </p>
          <Link
            href="/request"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl px-8 py-3 text-sm font-semibold text-stone-900 transition hover:brightness-110 active:scale-[0.98]"
            style={{
              background: `linear-gradient(180deg, ${STOREFRONT_GOLD} 0%, #9A7B3C 100%)`,
            }}
          >
            {pricing.ctaUnsureButton}
          </Link>
        </section>
      </div>
    </main>
  );
}
