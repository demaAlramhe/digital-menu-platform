import { formatMessage } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/types";
import { SITE_STATS } from "@/lib/site/stats";

const TRUST_CARDS = [
  { titleKey: "card1Title", textKey: "card1Text", Icon: VenueIcon },
  { titleKey: "card2Title", textKey: "card2Text", Icon: QrExperienceIcon },
  { titleKey: "card3Title", textKey: "card3Text", Icon: DashboardIcon },
  { titleKey: "card4Title", textKey: "card4Text", Icon: GrowthIcon },
] as const;

type TrustSectionProps = {
  dict: Dictionary;
};

export function TrustSection({ dict }: TrustSectionProps) {
  const trust = dict.home.trust;

  const statItems = [
    {
      label:
        SITE_STATS.restaurantsCount === null
          ? trust.restaurantsFallback
          : formatMessage(trust.restaurantsCount, {
              count: SITE_STATS.restaurantsCount,
            }),
      Icon: StoreStatIcon,
    },
    {
      label: formatMessage(trust.languagesStat, {
        count: SITE_STATS.languagesCount,
      }),
      Icon: LanguagesStatIcon,
    },
    {
      label: formatMessage(trust.plansStat, { count: SITE_STATS.plansCount }),
      Icon: PlansStatIcon,
    },
  ] as const;

  return (
    <section
      id="trust"
      className="scroll-mt-20 border-y border-slate-200/80 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
            {trust.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            {trust.subtitle}
          </p>
        </div>

        <ul className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          {statItems.map((stat) => (
            <li
              key={stat.label}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm sm:px-5"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <stat.Icon />
              </span>
              <span className="text-sm font-semibold text-slate-800 sm:text-base">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {TRUST_CARDS.map((card) => (
            <li
              key={card.titleKey}
              className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200/80 hover:shadow-md sm:p-7"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-100 transition group-hover:bg-amber-100">
                <card.Icon />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {trust[card.titleKey]}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                {trust[card.textKey]}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function VenueIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
      aria-hidden
    >
      <path
        d="M4 10h16M6 10V20M10 10V20M14 10V20M18 10V20M5 6l7-4 7 4M8 20h8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QrExperienceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M14 14h2v2h-2zM18 14h2v6h-2zM14 18h2v2h-2z" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
      aria-hidden
    >
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
      aria-hidden
    >
      <path
        d="M4 18V6M4 18h16M8 14l3-3 3 2 5-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StoreStatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        d="M3 10h18M5 10V19M9 10V19M15 10V19M19 10V19M6 6l6-3 6 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LanguagesStatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9M12 3c-2.5 2.5-4 6-4 9s1.5 6.5 4 9" />
    </svg>
  );
}

function PlansStatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
    </svg>
  );
}
