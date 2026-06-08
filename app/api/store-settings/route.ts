import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { resolveOwnerStoreIdForApi } from "@/lib/auth/resolve-owner-store";
import { translateContentFields } from "@/lib/ai/translate-content";
import { trilingualColumns } from "@/lib/ai/trilingual-db";
import { DEFAULT_WELCOME_CTA } from "@/lib/content/default-welcome-cta";
import { parseJsonBody } from "@/lib/api/validation";
import { storeSettingsPatchSchema } from "@/lib/api/schemas";
import {
  parseContentLocale,
  type ContentLocale,
} from "@/lib/content/pick-localized";
import { updateStoreOmittingMissingColumns } from "@/lib/supabase/column-errors";

type StoreSettingsUpdate = Record<string, unknown>;

export async function PATCH(req: Request) {
  try {
    const parsed = await parseJsonBody(req, storeSettingsPatchSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const {
      name,
      logoUrl,
      bannerUrl,
      heroImageUrl,
      menuBackgroundUrl,
      welcomeTitle,
      welcomeSubtitle,
      welcomeButtonText,
      showWelcomeScreen,
      defaultContentLanguage,
      primaryColor,
      secondaryColor,
      phone,
      whatsapp_number,
      email,
      address,
    } = parsed.data;

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

    const { translations, status: translationStatus } =
      await translateContentFields(sourceLocale, translateInputs);

    const titleT = translations.welcome_title;
    const subtitleT = translations.welcome_subtitle;
    const buttonT = buttonTrimmed
      ? translations.welcome_button
      : DEFAULT_WELCOME_CTA;

    const supabase = createAdminClient();

    const updatePayload: StoreSettingsUpdate = {
      name: name.trim(),
      logo_url: logoUrl || null,
      banner_url: bannerUrl || null,
      hero_image_url: heroImageUrl || null,
      menu_background_url: menuBackgroundUrl || null,
      default_content_language: sourceLocale,
      welcome_title: titleTrimmed || null,
      ...trilingualColumns("welcome_title", titleT),
      welcome_subtitle: subtitleTrimmed || null,
      ...trilingualColumns("welcome_subtitle", subtitleT),
      welcome_button_text: buttonTrimmed || DEFAULT_WELCOME_CTA[sourceLocale],
      ...trilingualColumns("welcome_button_text", buttonT),
      show_welcome_screen: showWelcomeScreen !== false,
      primary_color: primaryColor || "#111827",
      secondary_color: secondaryColor || "#f59e0b",
      phone: phone || null,
      whatsapp_number: whatsapp_number || null,
      email: email || null,
      address: address || null,
    };

    const {
      data: updatedStore,
      error: updateError,
      skippedColumns,
    } = await updateStoreOmittingMissingColumns(updatePayload, async (payload) => {
      const result = await supabase
        .from("stores")
        .update(payload)
        .eq("id", storeId)
        .select()
        .single();
      return { data: result.data, error: result.error };
    });

    const migrationWarning =
      skippedColumns.length > 0
        ? `Some fields were not saved (missing DB columns: ${skippedColumns.join(", ")}). Run the SQL files in supabase/ folder.`
        : undefined;

    if (updateError || !updatedStore) {
      console.error("[store-settings] update failed:", updateError);
      return NextResponse.json(
        {
          error: "Failed to update store settings.",
          details: updateError?.message ?? updateError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store: updatedStore,
      translation: { status: translationStatus },
      ...(migrationWarning ? { migrationWarning } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}
