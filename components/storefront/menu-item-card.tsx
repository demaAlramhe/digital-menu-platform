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
};

export function MenuItemCard({
  item,
  primaryColor,
  secondaryColor,
  showFeaturedBadge = false,
}: MenuItemCardProps) {
  const { dict } = useLocale();
  const isFeatured = showFeaturedBadge || item.is_featured;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
        isFeatured ? "ring-2 ring-offset-1" : "border-slate-200"
      }`}
      style={isFeatured ? { borderColor: secondaryColor } : undefined}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[4/3] w-full shrink-0 sm:aspect-auto sm:h-32 sm:w-32 md:h-36 md:w-36">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[140px] w-full items-center justify-center bg-slate-100 text-sm text-slate-500 sm:min-h-0">
              {dict.common.noPhoto}
            </div>
          )}
          {isFeatured && (
            <span
              className="absolute start-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow"
              style={{ backgroundColor: primaryColor }}
            >
              {dict.menu.featured}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
              {item.name}
            </h3>
            <p
              className="shrink-0 text-lg font-bold tabular-nums sm:text-xl"
              style={{ color: primaryColor }}
            >
              {dict.common.currency}
              {formatPrice(item.price)}
            </p>
          </div>
          {item.description && (
            <p className="text-[15px] leading-relaxed text-slate-600 line-clamp-3">
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
