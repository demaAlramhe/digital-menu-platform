import { parseContentLocale, type ContentLocale } from "@/lib/content/pick-localized";
import type {
  MenuCategory,
  MenuItem,
  Store,
  StoreStatus,
  TrilingualField,
} from "@/types/store";
import type {
  MenuCategoryRow,
  MenuItemRow,
  StoreRow,
} from "@/types/rows";

function trilingual(
  legacy: string | null | undefined,
  ar: string | null | undefined,
  he: string | null | undefined,
  en: string | null | undefined
): TrilingualField {
  return {
    legacy: legacy ?? null,
    ar: ar ?? null,
    he: he ?? null,
    en: en ?? null,
  };
}

function parseStoreStatus(value: string): StoreStatus {
  if (value === "inactive" || value === "archived") return value;
  return "active";
}

function parseDefaultLanguage(value: string | null | undefined): ContentLocale {
  return parseContentLocale(value) ?? "ar";
}

export function mapStoreFromRow(row: StoreRow): Store {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: parseStoreStatus(row.status),
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    logoUrl: row.logo_url,
    bannerUrl: row.banner_url,
    heroImageUrl: row.hero_image_url,
    welcomeTitle: trilingual(
      row.welcome_title,
      row.welcome_title_ar,
      row.welcome_title_he,
      row.welcome_title_en
    ),
    welcomeSubtitle: trilingual(
      row.welcome_subtitle,
      row.welcome_subtitle_ar,
      row.welcome_subtitle_he,
      row.welcome_subtitle_en
    ),
    welcomeButtonText: trilingual(
      row.welcome_button_text,
      row.welcome_button_text_ar,
      row.welcome_button_text_he,
      row.welcome_button_text_en
    ),
    showWelcomeScreen: row.show_welcome_screen === true,
    defaultContentLanguage: parseDefaultLanguage(row.default_content_language),
    email: row.email,
    phone: row.phone,
    address: row.address,
    createdAt: row.created_at,
  };
}

export function mapMenuCategoryFromRow(row: MenuCategoryRow): MenuCategory {
  return {
    id: row.id,
    storeId: row.store_id,
    name: trilingual(row.name, row.name_ar, row.name_he, row.name_en),
    slug: row.slug,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function mapMenuItemFromRow(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    storeId: row.store_id,
    categoryId: row.category_id,
    name: trilingual(row.name, row.name_ar, row.name_he, row.name_en),
    description: trilingual(
      row.description,
      row.description_ar,
      row.description_he,
      row.description_en
    ),
    slug: row.slug,
    price: row.price,
    imageUrl: row.image_url,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

/** Row shape used by welcome content resolver (snake_case). */
export function storeRowToWelcomeSource(row: StoreRow) {
  return {
    name: row.name,
    default_content_language: row.default_content_language,
    welcome_title: row.welcome_title,
    welcome_title_ar: row.welcome_title_ar,
    welcome_title_he: row.welcome_title_he,
    welcome_title_en: row.welcome_title_en,
    welcome_subtitle: row.welcome_subtitle,
    welcome_subtitle_ar: row.welcome_subtitle_ar,
    welcome_subtitle_he: row.welcome_subtitle_he,
    welcome_subtitle_en: row.welcome_subtitle_en,
    welcome_button_text: row.welcome_button_text,
    welcome_button_text_ar: row.welcome_button_text_ar,
    welcome_button_text_he: row.welcome_button_text_he,
    welcome_button_text_en: row.welcome_button_text_en,
    hero_image_url: row.hero_image_url,
    banner_url: row.banner_url,
  };
}
