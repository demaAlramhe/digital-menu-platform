import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import {
  pickLocalizedText,
  parseContentLocale,
  type ContentLocale,
} from "@/lib/content/pick-localized";

export type StoreWelcomeSource = {
  name: string;
  default_content_language?: string | null;
  welcome_subtitle?: string | null;
  welcome_button_text?: string | null;
  welcome_subtitle_ar?: string | null;
  welcome_subtitle_he?: string | null;
  welcome_subtitle_en?: string | null;
  welcome_button_text_ar?: string | null;
  welcome_button_text_he?: string | null;
  welcome_button_text_en?: string | null;
  hero_image_url?: string | null;
  banner_url?: string | null;
};

export type ResolvedWelcomeContent = {
  welcomeMessage: string;
  buttonText: string;
  backgroundImageUrl: string | null;
};

export function resolveWelcomeContent(
  store: StoreWelcomeSource,
  dict: Dictionary,
  viewerLocale: Locale
): ResolvedWelcomeContent {
  const sourceLocale: ContentLocale =
    parseContentLocale(store.default_content_language) ?? "ar";

  const welcomeMessage = pickLocalizedText(
    viewerLocale,
    {
      ar: store.welcome_subtitle_ar,
      he: store.welcome_subtitle_he,
      en: store.welcome_subtitle_en,
    },
    sourceLocale,
    store.welcome_subtitle?.trim() || dict.store.welcomeMessage
  );

  const buttonText = pickLocalizedText(
    viewerLocale,
    {
      ar: store.welcome_button_text_ar,
      he: store.welcome_button_text_he,
      en: store.welcome_button_text_en,
    },
    sourceLocale,
    store.welcome_button_text?.trim() || dict.store.welcomeCta
  );

  const backgroundImageUrl =
    store.banner_url?.trim() ||
    store.hero_image_url?.trim() ||
    null;

  return { welcomeMessage, buttonText, backgroundImageUrl };
}
