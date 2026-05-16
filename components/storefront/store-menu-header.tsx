import Link from "next/link";

type StoreMenuHeaderProps = {
  storeSlug: string;
  storeName: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  showBackLink?: boolean;
  labels: {
    digitalMenu: string;
    backLinkText: string;
  };
};

export function StoreMenuHeader({
  storeSlug,
  storeName,
  logoUrl,
  bannerUrl,
  primaryColor,
  secondaryColor,
  showBackLink = true,
  labels,
}: StoreMenuHeaderProps) {
  const initial = storeName?.charAt(0)?.toUpperCase() || "M";

  return (
    <header className="relative overflow-hidden bg-white shadow-[0_1px_0_0_rgba(15,23,42,0.06)]">
      {bannerUrl ? (
        <div className="relative h-44 w-full sm:h-52">
          <img
            src={bannerUrl}
            alt=""
            className="h-full w-full scale-105 object-cover"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}99 0%, transparent 55%, ${secondaryColor}66 100%)`,
            }}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-5 pt-16 sm:pb-6">
            <div className="mx-auto flex max-w-2xl items-end gap-4">
              <StoreLogo
                logoUrl={logoUrl}
                initial={initial}
                primaryColor={primaryColor}
                variant="onBanner"
              />
              <div className="min-w-0 flex-1 pb-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
                  {labels.digitalMenu}
                </p>
                <h1 className="mt-1 truncate text-[1.65rem] font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                  {storeName}
                </h1>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative px-4 py-8 sm:py-10"
          style={{
            background: `linear-gradient(165deg, ${secondaryColor}22 0%, #ffffff 42%, ${primaryColor}08 100%)`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `radial-gradient(circle at 100% 0%, ${primaryColor}18, transparent 42%), radial-gradient(circle at 0% 100%, ${secondaryColor}22, transparent 38%)`,
            }}
            aria-hidden
          />
          <div className="relative mx-auto flex max-w-2xl items-center gap-4 sm:gap-5">
            <StoreLogo
              logoUrl={logoUrl}
              initial={initial}
              primaryColor={primaryColor}
              variant="default"
            />
            <div className="min-w-0 flex-1">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: primaryColor }}
              >
                {labels.digitalMenu}
              </p>
              <h1
                className="mt-1 text-[1.65rem] font-semibold leading-tight tracking-tight sm:text-3xl"
                style={{ color: primaryColor }}
              >
                {storeName}
              </h1>
            </div>
          </div>
        </div>
      )}

      {showBackLink && (
        <div className="border-t border-stone-100/90 bg-stone-50/50 px-4 py-2.5">
          <div className="mx-auto max-w-2xl">
            <Link
              href={`/${storeSlug}`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-stone-200/80 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-600 shadow-sm transition hover:border-stone-300 hover:text-stone-900 active:scale-[0.98]"
            >
              <BackChevron />
              <span className="truncate">{labels.backLinkText}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function BackChevron() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 shrink-0 rtl:rotate-180"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StoreLogo({
  logoUrl,
  initial,
  primaryColor,
  variant,
}: {
  logoUrl?: string | null;
  initial: string;
  primaryColor: string;
  variant: "default" | "onBanner";
}) {
  const sizeClass =
    variant === "onBanner"
      ? "h-[4.25rem] w-[4.25rem] rounded-2xl ring-[3px] ring-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.28)] sm:h-20 sm:w-20"
      : "h-[4.25rem] w-[4.25rem] rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] ring-1 ring-stone-200/80 sm:h-20 sm:w-20";

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        className={`${sizeClass} shrink-0 bg-white object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center bg-white text-2xl font-semibold sm:text-3xl`}
      style={{ color: primaryColor }}
    >
      {initial}
    </div>
  );
}
