import Link from "next/link";
import { getDirection } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";
import {
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_LIGHT,
} from "@/lib/storefront/premium-theme";

const PLAN_IDS = ["basic", "pro", "premium"] as const;

const MAINTENANCE_BY_PLAN = {
  basic: "maintenanceBasic",
  pro: "maintenancePro",
  premium: "maintenancePremium",
} as const satisfies Record<
  (typeof PLAN_IDS)[number],
  "maintenanceBasic" | "maintenancePro" | "maintenancePremium"
>;

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
        <header className="mb-10 text-center">
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
            {pricing.title}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-white/75">
            {pricing.subtitle}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {PLAN_IDS.map((planId) => {
            const plan = pricing.plans[planId];
            const highlight = planId === "pro";
            const maintenance = pricing[MAINTENANCE_BY_PLAN[planId]];

            return (
              <article
                key={planId}
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
                    {pricing.mostPopular}
                  </span>
                )}

                <h2
                  className="text-xl font-bold"
                  style={{ color: STOREFRONT_GOLD_LIGHT }}
                >
                  {plan.name}
                </h2>
                <p className="mt-4 text-4xl font-bold tracking-tight">
                  {plan.price}
                </p>
                <p className="mt-1 text-sm text-white/50">
                  {pricing.oneTimeSetup}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {maintenance}
                </p>

                <ul className="mt-6 flex-1 space-y-3 text-sm leading-relaxed text-white/85">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span style={{ color: STOREFRONT_GOLD }} aria-hidden>
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/request?plan=${planId}`}
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
                  {plan.cta}
                </Link>
              </article>
            );
          })}
        </div>

        <footer className="mt-10 text-center text-sm text-white/65">
          <p>
            {pricing.contactPrompt}{" "}
            <Link
              href="/request"
              className="font-medium text-[#E8D5A8] hover:underline"
            >
              {pricing.contactLink}
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
