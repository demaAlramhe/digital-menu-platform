import "server-only";

import {
  translateContentFields,
  type TranslateFieldInput,
} from "@/lib/ai/translate-content";
import { trilingualColumns } from "@/lib/ai/trilingual-db";
import { DEFAULT_WELCOME_CTA } from "@/lib/content/default-welcome-cta";
import type { ContentLocale } from "@/lib/content/pick-localized";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TranslationStatus } from "@/lib/i18n/translation-status";

export type RetranslateStoreResult = {
  categoriesUpdated: number;
  itemsUpdated: number;
  welcomeUpdated: boolean;
  translationStatus: TranslationStatus;
};

/**
 * Re-runs AI translation for all menu + welcome content in a store.
 * Uses legacy `name` / `description` / `welcome_*` columns as source text.
 */
export async function retranslateStoreContent(
  storeId: string,
  sourceLocale: ContentLocale
): Promise<RetranslateStoreResult> {
  const supabase = createAdminClient();
  let worstStatus: TranslationStatus = "translated";

  function mergeStatus(status: TranslationStatus) {
    if (status === "source_only_error" || status === "source_only_no_key") {
      worstStatus = status;
      return;
    }
    if (status === "partial" && worstStatus === "translated") {
      worstStatus = "partial";
    }
  }

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("id, name")
    .eq("store_id", storeId);

  let categoriesUpdated = 0;

  for (const category of categories ?? []) {
    const name = category.name?.trim();
    if (!name) continue;

    const { translations, status } = await translateContentFields(sourceLocale, [
      { key: "name", text: name, kind: "category_name" },
    ]);
    mergeStatus(status);

    const nameT = translations.name;
    if (!nameT) continue;

    const { error } = await supabase
      .from("menu_categories")
      .update({
        name,
        ...trilingualColumns("name", nameT),
      })
      .eq("id", category.id);

    if (!error) categoriesUpdated += 1;
  }

  const { data: items } = await supabase
    .from("menu_items")
    .select("id, name, description")
    .eq("store_id", storeId);

  let itemsUpdated = 0;

  for (const item of items ?? []) {
    const name = item.name?.trim();
    if (!name) continue;

    const description = item.description?.trim() ?? "";
    const inputs: TranslateFieldInput[] = [
      { key: "name", text: name, kind: "menu_item_name" },
    ];
    if (description) {
      inputs.push({
        key: "description",
        text: description,
        kind: "menu_item_description",
      });
    }

    const { translations, status } = await translateContentFields(
      sourceLocale,
      inputs
    );
    mergeStatus(status);

    const { error } = await supabase
      .from("menu_items")
      .update({
        name,
        ...trilingualColumns("name", translations.name),
        description: description || null,
        ...trilingualColumns("description", translations.description),
      })
      .eq("id", item.id);

    if (!error) itemsUpdated += 1;
  }

  const { data: store } = await supabase
    .from("stores")
    .select("welcome_title, welcome_subtitle, welcome_button_text")
    .eq("id", storeId)
    .maybeSingle();

  let welcomeUpdated = false;

  if (store) {
    const title = store.welcome_title?.trim() ?? "";
    const subtitle = store.welcome_subtitle?.trim() ?? "";
    const button = store.welcome_button_text?.trim() ?? "";

    const welcomeInputs: TranslateFieldInput[] = [];
    if (title) {
      welcomeInputs.push({
        key: "welcome_title",
        text: title,
        kind: "welcome_title",
      });
    }
    if (subtitle) {
      welcomeInputs.push({
        key: "welcome_subtitle",
        text: subtitle,
        kind: "welcome_subtitle",
      });
    }
    if (button) {
      welcomeInputs.push({
        key: "welcome_button",
        text: button,
        kind: "welcome_button",
      });
    }

    let titleT = undefined;
    let subtitleT = undefined;
    let buttonT = button ? undefined : DEFAULT_WELCOME_CTA;

    if (welcomeInputs.length > 0) {
      const { translations, status } = await translateContentFields(
        sourceLocale,
        welcomeInputs
      );
      mergeStatus(status);
      titleT = translations.welcome_title;
      subtitleT = translations.welcome_subtitle;
      buttonT = button
        ? translations.welcome_button
        : DEFAULT_WELCOME_CTA;
    } else {
      buttonT = DEFAULT_WELCOME_CTA;
    }

    const updatePayload: Record<string, unknown> = {
      welcome_button_text: button || DEFAULT_WELCOME_CTA[sourceLocale],
      ...trilingualColumns("welcome_button_text", buttonT),
    };

    if (title && titleT) {
      updatePayload.welcome_title = title;
      Object.assign(updatePayload, trilingualColumns("welcome_title", titleT));
    }
    if (subtitle && subtitleT) {
      updatePayload.welcome_subtitle = subtitle;
      Object.assign(
        updatePayload,
        trilingualColumns("welcome_subtitle", subtitleT)
      );
    }

    const { error } = await supabase
      .from("stores")
      .update(updatePayload)
      .eq("id", storeId);

    welcomeUpdated = !error;
  }

  return {
    categoriesUpdated,
    itemsUpdated,
    welcomeUpdated,
    translationStatus: worstStatus,
  };
}
