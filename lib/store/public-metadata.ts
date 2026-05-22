import type { Metadata } from "next";
import { getActiveStoreBySlug } from "@/lib/data/public-store";
import { getSiteOrigin } from "@/lib/utils/public-menu-url";
import { storeRowToWelcomeSource } from "@/lib/types/mappers";
import { resolveWelcomeContent } from "@/lib/store/welcome-content";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import type { StoreRow } from "@/types/rows";

function pickOgImage(store: StoreRow): string | undefined {
  const candidate =
    store.banner_url?.trim() ||
    store.hero_image_url?.trim() ||
    store.logo_url?.trim();
  return candidate || undefined;
}

export async function buildStorePublicMetadata(
  storeSlug: string,
  page: "welcome" | "menu"
): Promise<Metadata> {
  const { store, error } = await getActiveStoreBySlug(storeSlug);

  if (error || !store) {
    return {
      title: "Menu",
      robots: { index: false, follow: false },
    };
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const storeName = store.name?.trim() || dict.menu.digitalMenu;

  let description = dict.store.aboutText;
  if (page === "welcome") {
    const content = resolveWelcomeContent(
      storeRowToWelcomeSource(store),
      dict,
      locale
    );
    description = content.welcomeMessage;
  }

  const title =
    page === "menu"
      ? `${storeName} — ${dict.menu.digitalMenu}`
      : storeName;

  const origin = await getSiteOrigin();
  const path = page === "menu" ? `/${storeSlug}/menu` : `/${storeSlug}`;
  const canonical = origin ? `${origin}${path}` : path;
  const ogImage = pickOgImage(store);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: storeName,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, alt: storeName }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: { index: true, follow: true },
  };
}
