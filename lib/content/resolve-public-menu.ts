import type { Locale } from "@/lib/i18n/types";
import {
  pickLocalizedOptional,
  pickLocalizedText,
  parseContentLocale,
  type ContentLocale,
} from "@/lib/content/pick-localized";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  name_ar?: string | null;
  name_he?: string | null;
  name_en?: string | null;
};

type MenuItemRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
  category_id: string | null;
  name_ar?: string | null;
  name_he?: string | null;
  name_en?: string | null;
  description_ar?: string | null;
  description_he?: string | null;
  description_en?: string | null;
};

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
  categories: CategoryRow[],
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
  store: { default_content_language?: string | null } | null
): ContentLocale {
  return parseContentLocale(store?.default_content_language) ?? "ar";
}
