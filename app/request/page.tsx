import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { marketingLinkFocus } from "@/components/marketing/marketing-form-styles";
import { SignupRequestForm } from "@/components/signups/signup-request-form";
import { SiteHeader } from "@/components/i18n/site-header";

type RequestPageProps = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function RequestPage({ searchParams }: RequestPageProps) {
  const { plan } = await searchParams;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark">
      <SiteHeader />

      <main dir="rtl" lang="ar" className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-lg">
          <header className="mb-8 text-center">
            <Link
              href="/pricing"
              className={`text-sm text-[#6b7280] transition hover:text-brand-dark ${marketingLinkFocus} rounded-sm`}
            >
              ← العودة للباقات
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-brand-dark">
              ابدأ إعداد قائمتك الرقمية
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
              عبّي البيانات وسنتواصل معك خلال 24 ساعة
            </p>
          </header>

          <SignupRequestForm initialPlan={plan ?? null} />
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
