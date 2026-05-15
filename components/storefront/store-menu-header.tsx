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
    <header className="border-b border-slate-200/80 bg-white">
      {bannerUrl ? (
        <div className="relative h-40 w-full overflow-hidden sm:h-48">
          <img
            src={bannerUrl}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${primaryColor}ee 0%, transparent 70%)`,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-12">
            <div className="mx-auto flex max-w-2xl items-end gap-4">
              <StoreLogo
                logoUrl={logoUrl}
                initial={initial}
                primaryColor={primaryColor}
                variant="onBanner"
              />
              <div className="min-w-0 flex-1 pb-1 text-white">
                <p className="text-xs font-medium uppercase tracking-wider text-white/80">
                  {labels.digitalMenu}
                </p>
                <h1 className="truncate text-2xl font-bold leading-tight sm:text-3xl">
                  {storeName}
                </h1>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="px-4 py-6 sm:py-8"
          style={{
            background: `linear-gradient(135deg, ${secondaryColor}33 0%, #ffffff 55%)`,
          }}
        >
          <div className="mx-auto flex max-w-2xl items-center gap-4">
            <StoreLogo
              logoUrl={logoUrl}
              initial={initial}
              primaryColor={primaryColor}
              variant="default"
            />
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: primaryColor }}
              >
                {labels.digitalMenu}
              </p>
              <h1
                className="text-2xl font-bold leading-tight sm:text-3xl"
                style={{ color: primaryColor }}
              >
                {storeName}
              </h1>
            </div>
          </div>
        </div>
      )}

      {showBackLink && (
        <div className="border-t border-slate-100 px-4 py-2">
          <div className="mx-auto max-w-2xl">
            <Link
              href={`/${storeSlug}`}
              className="inline-flex min-h-11 items-center text-sm font-medium text-slate-600 active:text-slate-900"
            >
              ← {labels.backLinkText}
            </Link>
          </div>
        </div>
      )}
    </header>
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
      ? "h-16 w-16 rounded-2xl border-2 border-white shadow-lg sm:h-20 sm:w-20"
      : "h-16 w-16 rounded-2xl border-2 shadow-md sm:h-20 sm:w-20";

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
      className={`${sizeClass} flex shrink-0 items-center justify-center bg-white text-2xl font-bold sm:text-3xl`}
      style={{ borderColor: primaryColor, color: primaryColor }}
    >
      {initial}
    </div>
  );
}
