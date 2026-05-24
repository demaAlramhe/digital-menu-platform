import "server-only";

import type { ContentLocale } from "@/lib/content/pick-localized";
import type { TranslationStatus } from "@/lib/i18n/translation-status";

const CONTENT_LOCALES: ContentLocale[] = ["ar", "he", "en"];

export type TranslatableFieldKind =
  | "category_name"
  | "menu_item_name"
  | "menu_item_description"
  | "welcome_title"
  | "welcome_subtitle"
  | "welcome_button";

export type TranslateFieldInput = {
  key: string;
  text: string;
  kind: TranslatableFieldKind;
};

export type TrilingualResult = Record<ContentLocale, string>;

const KIND_HINTS: Record<TranslatableFieldKind, string> = {
  category_name: "restaurant menu category name — short, clear",
  menu_item_name: "restaurant menu dish or drink name",
  menu_item_description:
    "restaurant menu item description — appetizing, concise, 1–2 sentences max",
  welcome_title: "restaurant welcome screen headline",
  welcome_subtitle: "restaurant welcome message for guests",
  welcome_button: "call-to-action button on welcome screen — very short (2–4 words)",
};

function emptyTrilingual(): TrilingualResult {
  return { ar: "", he: "", en: "" };
}

function fallbackFromSource(
  sourceLocale: ContentLocale,
  fields: TranslateFieldInput[]
): Record<string, TrilingualResult> {
  const out: Record<string, TrilingualResult> = {};
  for (const field of fields) {
    const text = field.text.trim();
    if (!text) continue;
    out[field.key] = emptyTrilingual();
    out[field.key][sourceLocale] = text;
  }
  return out;
}

export type TranslateFieldsResult = {
  translations: Record<string, TrilingualResult>;
  status: TranslationStatus;
};

function isPartialTranslation(
  sourceLocale: ContentLocale,
  inputs: TranslateFieldInput[],
  translations: Record<string, TrilingualResult>
): boolean {
  for (const field of inputs) {
    const row = translations[field.key];
    if (!row) continue;
    for (const locale of CONTENT_LOCALES) {
      if (locale === sourceLocale) continue;
      if (!row[locale]?.trim()) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Translates owner-entered content into ar / he / en once on save.
 * Requires OPENAI_API_KEY; without it, only the source locale is stored.
 */
export async function translateContentFields(
  sourceLocale: ContentLocale,
  fields: TranslateFieldInput[]
): Promise<TranslateFieldsResult> {
  const inputs = fields.filter((f) => f.text.trim());
  if (inputs.length === 0) {
    return { translations: {}, status: "translated" };
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      translations: fallbackFromSource(sourceLocale, inputs),
      status: "source_only_no_key",
    };
  }

  try {
    const translated = await requestOpenAITranslations(
      apiKey,
      sourceLocale,
      inputs
    );
    for (const field of inputs) {
      translated[field.key][sourceLocale] = field.text.trim();
    }
    const status = isPartialTranslation(sourceLocale, inputs, translated)
      ? "partial"
      : "translated";
    return { translations: translated, status };
  } catch (error) {
    console.error("[translate-content]", error);
    return {
      translations: fallbackFromSource(sourceLocale, inputs),
      status: "source_only_error",
    };
  }
}

async function requestOpenAITranslations(
  apiKey: string,
  sourceLocale: ContentLocale,
  fields: TranslateFieldInput[]
): Promise<Record<string, TrilingualResult>> {
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const payload = fields.map((f) => ({
    key: f.key,
    sourceText: f.text.trim(),
    context: KIND_HINTS[f.kind],
  }));

  const sourceLabel =
    sourceLocale === "ar"
      ? "Arabic"
      : sourceLocale === "he"
        ? "Hebrew"
        : "English";

  const systemPrompt = `You translate restaurant digital-menu content. The owner wrote in ${sourceLabel}.
Return natural, short, guest-friendly wording (not literal or robotic).
Keep brand names as appropriate. Menu descriptions: 1–2 sentences max.
For each field, return ALL three locales "ar", "he", "en". The ${sourceLabel} value must match the source text (lightly edited only if needed).
Respond with JSON only: keys match input "key" fields; each value is { "ar": "...", "he": "...", "en": "..." }.`;

  const userPrompt = JSON.stringify({ sourceLocale, fields: payload });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty OpenAI response");
  }

  const parsed = JSON.parse(raw) as Record<
    string,
    Partial<Record<ContentLocale, string>>
  >;

  const result: Record<string, TrilingualResult> = {};

  for (const field of fields) {
    const row = parsed[field.key];
    result[field.key] = emptyTrilingual();
    for (const locale of CONTENT_LOCALES) {
      const value = row?.[locale];
      if (typeof value === "string" && value.trim()) {
        result[field.key][locale] = value.trim();
      }
    }
  }

  return result;
}
