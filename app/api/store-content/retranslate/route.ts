import { NextResponse } from "next/server";
import { retranslateStoreContent } from "@/lib/content/retranslate-store-content";
import { getStoreDefaultContentLanguage } from "@/lib/content/store-language";
import { resolveOwnerStoreIdForApi } from "@/lib/auth/resolve-owner-store";
import { appendTranslationNote } from "@/lib/dashboard/translation-feedback";
import { formatMessage, getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export async function POST() {
  try {
    const { storeId, errorResponse } = await resolveOwnerStoreIdForApi();
    if (errorResponse) {
      return errorResponse;
    }

    const sourceLocale = await getStoreDefaultContentLanguage(storeId);
    const result = await retranslateStoreContent(storeId, sourceLocale);

    const locale = await getLocale();
    const dict = getDictionary(locale);
    const message = appendTranslationNote(
      dict,
      formatMessage(dict.settings.retranslateSuccess, {
        categories: String(result.categoriesUpdated),
        items: String(result.itemsUpdated),
      }),
      result.translationStatus
    );

    return NextResponse.json({
      success: true,
      message,
      ...result,
      translation: { status: result.translationStatus },
    });
  } catch (error) {
    console.error("[retranslate]", error);
    return NextResponse.json(
      { error: "Failed to retranslate store content." },
      { status: 500 }
    );
  }
}
