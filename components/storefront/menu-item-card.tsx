"use client";

import { useLocale } from "@/components/i18n/locale-provider";

export type MenuItemDisplay = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_featured?: boolean;
};

type MenuItemCardProps = {
  item: MenuItemDisplay;
  primaryColor: string;
  secondaryColor: string;
  showFeaturedBadge?: boolean;
  variant?: "default" | "featured";
};

export function MenuItemCard({
  item,
  primaryColor,
  secondaryColor,
  showFeaturedBadge = false,
  variant = "default",
}: MenuItemCardProps) {
  const { dict } = useLocale();
  const isFeatured = variant === "featured" || showFeaturedBadge || item.is_featured;

  return (
    <article
      className={`group overflow-hidden rounded-2xl bg-white transition-shadow duration-300 ${
        isFeatured
          ? "shadow-[0_12px_40px_rgba(15,23,42,0.1)] ring-1 ring-stone-200/80"
          : "shadow-[0_4px_20px_rgba(15,23,42,0.06)] ring-1 ring-stone-200/60 hover:shadow-[0_8px_28px_rgba(15,23,42,0.09)]"
      }`}
    >
      <div
        className={`flex gap-0 ${isFeatured ? "flex-col sm:flex-row" : "flex-row"}`}
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-stone-100 ${
            isFeatured
              ? "aspect-[16/10] w-full sm:aspect-auto sm:h-40 sm:w-40 md:h-44 md:w-44"
              : "h-[7.25rem] w-[7.25rem] sm:h-32 sm:w-32"
          }`}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200/80">
              <PlateIcon className="h-8 w-8 text-stone-400/80" />
            </div>
          )}
          {isFeatured && (
            <span
              className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-lg"
              style={{ backgroundColor: secondaryColor }}
            >
              <StarIcon className="h-3 w-3" />
              {dict.menu.featured}
            </span>
          )}
        </div>

        <div
          className={`flex min-w-0 flex-1 flex-col justify-center ${
            isFeatured ? "gap-2.5 p-4 sm:p-5" : "gap-2 p-3.5 sm:p-4"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`font-semibold leading-snug text-stone-900 ${
                isFeatured ? "text-lg sm:text-xl" : "text-base sm:text-lg"
              }`}
            >
              {item.name}
            </h3>
            <p
              className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-sm font-bold tabular-nums sm:text-base"
              style={{
                color: primaryColor,
                backgroundColor: `${primaryColor}12`,
              }}
            >
              <span className="text-[11px] font-semibold opacity-80">
                {dict.common.currency}
              </span>
              {formatPrice(item.price)}
            </p>
          </div>
          {item.description && (
            <p
              className={`leading-relaxed text-stone-600 ${
                isFeatured
                  ? "line-clamp-3 text-[15px]"
                  : "line-clamp-2 text-sm sm:line-clamp-3"
              }`}
            >
              {item.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.37 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.37-3.292Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PlateIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
