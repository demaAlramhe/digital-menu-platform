import Link from "next/link";
import { SignupRequestForm } from "@/components/signups/signup-request-form";
import { STOREFRONT_GOLD_LIGHT } from "@/lib/storefront/premium-theme";

type RequestPageProps = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function RequestPage({ searchParams }: RequestPageProps) {
  const { plan } = await searchParams;

  return (
    <main
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-stone-900 px-4 py-10 text-white sm:px-6 sm:py-14"
    >
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <Link
            href="/pricing"
            className="text-sm text-white/55 transition hover:text-white/80"
          >
            ← العودة للباقات
          </Link>
          <h1
            className="mt-4 text-3xl font-bold"
            style={{ color: STOREFRONT_GOLD_LIGHT }}
          >
            اطلب منيوك الرقمي
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            عبّي البيانات وسنتواصل معك خلال 24 ساعة
          </p>
        </header>

        <SignupRequestForm initialPlan={plan ?? null} />
      </div>
    </main>
  );
}
