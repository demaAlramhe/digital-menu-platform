import {
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_LIGHT,
} from "@/lib/storefront/premium-theme";

type MenuSectionHeadingProps = {
  title: string;
  subtitle?: string;
  primaryColor: string;
  accent?: "default" | "featured";
  theme?: "default" | "premium";
};

export function MenuSectionHeading({
  title,
  subtitle,
  primaryColor,
  accent = "default",
  theme = "default",
}: MenuSectionHeadingProps) {
  const isFeatured = accent === "featured";
  const isPremium = theme === "premium";

  if (isPremium) {
    return (
      <div className="relative mb-5 sm:mb-6">
        <div
          className="absolute -inset-x-1 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#d4b87a]/40 to-transparent"
          aria-hidden
        />
        <div className="relative flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-1 shrink-0 rounded-full sm:h-9"
              style={{ backgroundColor: STOREFRONT_GOLD }}
              aria-hidden
            />
            <h2
              className={`font-semibold tracking-tight ${
                isFeatured
                  ? "text-2xl sm:text-[1.65rem]"
                  : "text-xl sm:text-2xl"
              }`}
              style={{ color: STOREFRONT_GOLD_LIGHT }}
            >
              {title}
            </h2>
          </div>
          {subtitle && (
            <p
              className={`leading-relaxed text-white/65 ${
                isFeatured ? "ps-4 text-sm sm:text-[15px]" : "ps-4 text-sm"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-5 sm:mb-6">
      <div
        className="absolute -inset-x-1 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-slate-200/80 to-transparent"
        aria-hidden
      />
      <div className="relative flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <span
            className="h-8 w-1 shrink-0 rounded-full sm:h-9"
            style={{ backgroundColor: primaryColor }}
            aria-hidden
          />
          <h2
            className={`font-semibold tracking-tight text-slate-900 ${
              isFeatured
                ? "text-2xl sm:text-[1.65rem]"
                : "text-xl sm:text-2xl"
            }`}
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p
            className={`leading-relaxed text-slate-500 ${
              isFeatured ? "ps-4 text-sm sm:text-[15px]" : "ps-4 text-sm"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
