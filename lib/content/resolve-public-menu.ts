import type { Locale } from "@/lib/i18n/types";
import {
  pickLocalizedOptional,
  pickLocalizedText,
  parseContentLocale,
  type ContentLocale,
} from "@/lib/content/pick-localized";
import type { MenuCategoryRow, MenuItemRow, StoreRow } from "@/types/rows";

export type { MenuCategoryRow, MenuItemRow };

export type ResolvedCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type ResolvedMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
  category_id: string | null;
};

export function resolvePublicCategories(
  categories: MenuCategoryRow[],
  viewerLocale: Locale,
  sourceLocale: ContentLocale
): ResolvedCategory[] {
  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    sort_order: category.sort_order,
    name: pickLocalizedText(
      viewerLocale,
      {
        ar: category.name_ar,
        he: category.name_he,
        en: category.name_en,
      },
      sourceLocale,
      category.name
    ),
  }));
}

export function resolvePublicMenuItems(
  items: MenuItemRow[],
  viewerLocale: Locale,
  sourceLocale: ContentLocale
): ResolvedMenuItem[] {
  return items.map((item) => ({
    id: item.id,
    price: item.price,
    image_url: item.image_url,
    is_featured: item.is_featured,
    sort_order: item.sort_order,
    category_id: item.category_id,
    name: pickLocalizedText(
      viewerLocale,
      { ar: item.name_ar, he: item.name_he, en: item.name_en },
      sourceLocale,
      item.name
    ),
    description: pickLocalizedOptional(
      viewerLocale,
      {
        ar: item.description_ar,
        he: item.description_he,
        en: item.description_en,
      },
      sourceLocale,
      item.description
    ),
  }));
}

export function getSourceLocaleFromStore(
  store: Pick<StoreRow, "default_content_language"> | null
): ContentLocale {
  return parseContentLocale(store?.default_content_language) ?? "ar";
}
