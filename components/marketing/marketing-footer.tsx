import Link from "next/link";
import { BelAfiaLogo } from "@/components/marketing/bel-afia-logo";
import { marketingLinkFocus } from "@/components/marketing/marketing-form-styles";
import { getTranslations } from "@/lib/i18n/server";

export async function MarketingFooter() {
  const { locale, dict } = await getTranslations();

  const footerCopyright =
    locale === "ar"
      ? "© 2026 Bel Afia — QR Menu. جميع الحقوق محفوظة."
      : locale === "he"
        ? "© 2026 Bel Afia — QR Menu. כל הזכויות שמורות."
        : "© 2026 Bel Afia — QR Menu. All rights reserved.";

  return (
    <footer className="border-t border-brand-secondary/40 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-8">
          <BelAfiaLogo variant="compact" className="h-9 w-9" />

          <p className="max-w-xl text-sm leading-relaxed text-[#6b7280]">
            {dict.home.footer}
          </p>

          <nav
            className="flex flex-wrap justify-center gap-4 text-sm text-[#6b7280]"
            aria-label={dict.nav.site}
          >
            <Link
              href="/pricing"
              className={`hover:text-brand-dark ${marketingLinkFocus} rounded-sm`}
            >
              {dict.nav.plans}
            </Link>
            <Link
              href="/request"
              className={`hover:text-brand-dark ${marketingLinkFocus} rounded-sm`}
            >
              {dict.nav.requestService}
            </Link>
            <Link
              href="/auth/login"
              className={`hover:text-brand-dark ${marketingLinkFocus} rounded-sm`}
            >
              {dict.common.login}
            </Link>
          </nav>

          <p className="text-xs text-[#6b7280]">{footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
}
