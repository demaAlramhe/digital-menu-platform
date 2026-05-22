import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { resolveOwnerStoreIdForApi } from "@/lib/auth/resolve-owner-store";
import { translateContentFields } from "@/lib/ai/translate-content";
import {
  parseContentLocale,
  type ContentLocale,
} from "@/lib/content/pick-localized";

type PatchBody = {
  name?: string;
  logoUrl?: string;
  bannerUrl?: string;
  heroImageUrl?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  welcomeButtonText?: string;
  showWelcomeScreen?: boolean;
  defaultContentLanguage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export async function PATCH(req: Request) {
  try {
    const body: PatchBody = await req.json();

    const {
      name,
      logoUrl,
      bannerUrl,
      heroImageUrl,
      welcomeTitle,
      welcomeSubtitle,
      welcomeButtonText,
      showWelcomeScreen,
      defaultContentLanguage,
      primaryColor,
      secondaryColor,
      phone,
      email,
      address,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Store name is required." },
        { status: 400 }
      );
    }

    const { storeId, errorResponse } = await resolveOwnerStoreIdForApi();
    if (errorResponse) {
      return errorResponse;
    }

    const sourceLocale: ContentLocale =
      parseContentLocale(defaultContentLanguage) ?? "ar";

    const titleTrimmed = welcomeTitle?.trim() ?? "";
    const subtitleTrimmed = welcomeSubtitle?.trim() ?? "";
    const buttonTrimmed = welcomeButtonText?.trim() ?? "";

    const translateInputs = [];
    if (titleTrimmed) {
      translateInputs.push({
        key: "welcome_title",
        text: titleTrimmed,
        kind: "welcome_title" as const,
      });
    }
    if (subtitleTrimmed) {
      translateInputs.push({
        key: "welcome_subtitle",
        text: subtitleTrimmed,
        kind: "welcome_subtitle" as const,
      });
    }
    if (buttonTrimmed) {
      translateInputs.push({
        key: "welcome_button",
        text: buttonTrimmed,
        kind: "welcome_button" as const,
      });
    }

    const translations = await translateContentFields(
      sourceLocale,
      translateInputs
    );

    const titleT = translations.welcome_title;
    const subtitleT = translations.welcome_subtitle;
    const buttonT = translations.welcome_button;

    const supabase = createAdminClient();

    const { data: updatedStore, error: updateError } = await supabase
      .from("stores")
      .update({
        name: name.trim(),
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        hero_image_url: heroImageUrl || null,
        default_content_language: sourceLocale,
        welcome_title: titleTrimmed || null,
        welcome_title_ar: titleT?.ar || null,
        welcome_title_he: titleT?.he || null,
        welcome_title_en: titleT?.en || null,
        welcome_subtitle: subtitleTrimmed || null,
        welcome_subtitle_ar: subtitleT?.ar || null,
        welcome_subtitle_he: subtitleT?.he || null,
        welcome_subtitle_en: subtitleT?.en || null,
        welcome_button_text: buttonTrimmed || null,
        welcome_button_text_ar: buttonT?.ar || null,
        welcome_button_text_he: buttonT?.he || null,
        welcome_button_text_en: buttonT?.en || null,
        show_welcome_screen: showWelcomeScreen === true,
        primary_color: primaryColor || "#111827",
        secondary_color: secondaryColor || "#f59e0b",
        phone: phone || null,
        email: email || null,
        address: address || null,
      })
      .eq("id", storeId)
      .select()
      .single();

    if (updateError || !updatedStore) {
      return NextResponse.json(
        { error: "Failed to update store settings.", details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store: updatedStore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}
