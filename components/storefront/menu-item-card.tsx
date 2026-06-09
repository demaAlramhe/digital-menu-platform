"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { calculateDiscount } from "@/lib/storefront/discount";
import {
  premiumGlassTileStyle,
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_LIGHT,
} from "@/lib/storefront/premium-theme";

export type MenuItemDisplay = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price?: number | null;
  image_url: string | null;
  is_featured?: boolean;
};

type MenuItemCardProps = {
  item: MenuItemDisplay;
  primaryColor: string;
  secondaryColor: string;
  showFeaturedBadge?: boolean;
  showDiscount?: boolean;
  variant?: "default" | "featured";
  theme?: "default" | "premium";
};

/** Vertical card for grid layouts (image on top, details below). */
export function MenuItemCard({
  item,
  primaryColor,
  secondaryColor,
  showFeaturedBadge = false,
  showDiscount = false,
  variant = "default",
  theme = "default",
}: MenuItemCardProps) {
  const { dict } = useLocale();
  const isFeatured =
    variant === "featured" || showFeaturedBadge || item.is_featured;
  const isPremium = theme === "premium";
  const { hasDiscount, percentage } = calculateDiscount(
    item.price,
    item.original_price ?? null
  );
  const showDiscountUi = showDiscount || hasDiscount;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-200 ${
        isPremium
          ? "border border-[#d4b87a]/35 hover:scale-[1.02]"
          : `bg-white hover:scale-[1.02] ${
              variant === "featured"
                ? ""
                : "shadow-[0_4px_20px_rgba(15,23,42,0.06)] ring-1 ring-stone-200/60 hover:shadow-[0_8px_28px_rgba(15,23,42,0.09)]"
            }`
      }`}
      style={
        isPremium
          ? {
              ...premiumGlassTileStyle,
              ...(isFeatured
                ? {
                    border: `1px solid ${STOREFRONT_GOLD}`,
                    boxShadow:
                      "0 16px 48px rgba(201,169,98,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
                  }
                : {}),
            }
          : variant === "featured"
            ? {
                boxShadow: `0 12px 40px rgba(15,23,42,0.1), 0 0 0 2px ${secondaryColor}55`,
              }
            : undefined
      }
    >
      <div
        className={`relative aspect-square w-full shrink-0 overflow-hidden rounded-t-2xl ${
          isPremium ? "bg-black/40" : "bg-stone-100"
        }`}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center rounded-lg ${
              isPremium
                ? "bg-gradient-to-br from-black/50 to-black/30"
                : "bg-gradient-to-br from-stone-100 to-stone-200/80"
            }`}
          >
            <PlateIcon
              className={`h-10 w-10 ${isPremium ? "text-[#d4b87a]/60" : "text-stone-400/80"}`}
            />
          </div>
        )}
        {showDiscountUi && hasDiscount && (
          <span className="absolute start-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            -{percentage}%
          </span>
        )}
        {isFeatured && (
          <span
            className={`absolute inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-lg ${
              showDiscountUi && hasDiscount ? "end-2.5 top-2.5" : "start-2.5 top-2.5"
            }`}
            style={{
              backgroundColor: isPremium ? STOREFRONT_GOLD : secondaryColor,
              color: isPremium ? "#1a1408" : undefined,
            }}
          >
            <StarIcon className="h-3 w-3" />
            {dict.menu.featured}
          </span>
        )}
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col justify-between gap-2 ${
          variant === "featured" ? "p-4 sm:p-5" : "p-3.5 sm:p-4"
        }`}
      >
        <div className="min-w-0 space-y-2">
          <h3
            className={`font-semibold leading-snug ${
              isPremium ? "" : "text-stone-900"
            } ${
              variant === "featured"
                ? "text-base sm:text-lg"
                : "text-sm sm:text-base"
            }`}
            style={isPremium ? { color: STOREFRONT_GOLD_LIGHT } : undefined}
          >
            <span className="line-clamp-2">{item.name}</span>
          </h3>

          {showDiscountUi && hasDiscount && item.original_price != null ? (
            <div className="flex items-center gap-2">
              <span
                className={`text-sm line-through ${
                  isPremium ? "text-white/40" : "text-stone-400"
                }`}
              >
                {dict.common.currency}
                {formatPrice(item.original_price)}
              </span>
              <span
                className={`text-lg font-bold ${
                  isPremium ? "text-amber-400" : "text-amber-600"
                }`}
              >
                {dict.common.currency}
                {formatPrice(item.price)}
              </span>
            </div>
          ) : (
            <p
              className="inline-flex items-center rounded-full px-2.5 py-1 text-sm font-bold tabular-nums sm:text-base"
              style={
                isPremium
                  ? {
                      color: "#1a1408",
                      backgroundColor: STOREFRONT_GOLD,
                    }
                  : {
                      color: primaryColor,
                      backgroundColor: `${primaryColor}12`,
                    }
              }
            >
              <span className="text-[10px] font-semibold opacity-80 sm:text-xs">
                {dict.common.currency}
              </span>
              {formatPrice(item.price)}
            </p>
          )}

          {item.description && (
            <p
              className={`line-clamp-2 text-sm leading-relaxed ${
                isPremium ? "text-white/55" : "text-stone-500"
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
