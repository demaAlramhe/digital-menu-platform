import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { LegalDocumentBody } from "@/components/marketing/legal-document-body";
import { SiteHeader } from "@/components/i18n/site-header";
import { getDirection } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";
import { getLegalDocument } from "@/lib/legal/documents";

export default async function PrivacyPage() {
  const { locale, dict } = await getTranslations();
  const { document, contentLocale, isEnglishFallback } = getLegalDocument(
    "privacy",
    locale
  );
  const dir = getDirection(contentLocale);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark">
      <SiteHeader />

      <main dir={dir} lang={contentLocale} className="px-4 py-10 sm:px-6 sm:py-14">
        <LegalDocumentBody
          document={document}
          englishNote={
            isEnglishFallback ? dict.legal.englishComingSoon : null
          }
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
