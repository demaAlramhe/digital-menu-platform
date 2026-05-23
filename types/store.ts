import type { ContentLocale } from "@/lib/content/pick-localized";

/** Localized text columns stored as legacy + ar / he / en. */
export type TrilingualField = {
  legacy: string | null;
  ar: string | null;
  he: string | null;
  en: string | null;
};

export type StoreStatus = "active" | "inactive" | "archived";

export type Store = {
  id: string;
  slug: string;
  name: string;
  status: StoreStatus;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  heroImageUrl: string | null;
  menuBackgroundUrl: string | null;
  welcomeTitle: TrilingualField;
  welcomeSubtitle: TrilingualField;
  welcomeButtonText: TrilingualField;
  showWelcomeScreen: boolean;
  defaultContentLanguage: ContentLocale;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
};

export type MenuCategory = {
  id: string;
  storeId: string;
  name: TrilingualField;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type MenuItem = {
  id: string;
  storeId: string;
  categoryId: string | null;
  name: TrilingualField;
  description: TrilingualField;
  slug: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
};
