import type { Locale } from "@/lib/i18n/types";
import {
  pickLocalizedOptional,
  pickLocalizedText,
  parseContentLocale,
  type ContentLocale,
} from "@/lib/content/pick-localized";
import type { MenuCategoryRow, MenuItemRow, MenuItemVariantRow, StoreRow } from "@/types/rows";

export type { MenuCategoryRow, MenuItemRow, MenuItemVariantRow };

export type ResolvedCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type ResolvedMenuItemVariant = {
  id: string;
  name: string;
  price: number;
};

export type ResolvedMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
  category_id: string | null;
  variants?: ResolvedMenuItemVariant[];
};

type PublicMenuItemVariant = Pick<
  MenuItemVariantRow,
  "id" | "name" | "name_ar" | "name_he" | "name_en" | "price" | "sort_order" | "is_active" | "deleted_at"
>;

export type PublicMenuItem = MenuItemRow & {
  menu_item_variants?: PublicMenuItemVariant[] | null;
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
  items: PublicMenuItem[],
  viewerLocale: Locale,
  sourceLocale: ContentLocale
): ResolvedMenuItem[] {
  return items.map((item) => {
    const variants = (item.menu_item_variants ?? [])
      .filter((variant) => variant.is_active && variant.deleted_at == null)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((variant) => ({
        id: variant.id,
        price: Number(variant.price),
        name: pickLocalizedText(
          viewerLocale,
          { ar: variant.name_ar, he: variant.name_he, en: variant.name_en },
          sourceLocale,
          variant.name
        ),
      }));

    return {
      id: item.id,
      price: Number(item.price),
      original_price:
        item.original_price != null ? Number(item.original_price) : null,
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
      ...(variants.length > 0 ? { variants } : {}),
    };
  });
}

export function getSourceLocaleFromStore(
  store: Pick<StoreRow, "default_content_language"> | null
): ContentLocale {
  return parseContentLocale(store?.default_content_language) ?? "ar";
}
