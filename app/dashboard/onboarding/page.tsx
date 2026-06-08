import Link from "next/link";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { PageHeader } from "@/components/dashboard/ui/page-header";
import { dash } from "@/components/dashboard/ui/styles";
import {
  getOwnerStoreAdminClient,
  requireOwnerStoreId,
} from "@/lib/data/owner-store";
import { getOnboardingProgress } from "@/lib/dashboard/onboarding-steps";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const MANUAL_STEP_IDS = new Set(["preview", "qr"]);

export default async function OnboardingPage() {
  const storeId = await requireOwnerStoreId();
  const { dict } = await getTranslations();
  const supabase = getOwnerStoreAdminClient();

  const [storeResult, categoryResult, itemImageResult] = await Promise.all([
    supabase
      .from("stores")
      .select("name, logo_url, phone, primary_color, whatsapp_number")
      .eq("id", storeId)
      .single(),
    supabase
      .from("menu_categories")
      .select("*", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("is_active", true),
    supabase
      .from("menu_items")
      .select("*", { count: "exact", head: true })
      .eq("store_id", storeId)
      .not("image_url", "is", null)
      .eq("is_active", true),
  ]);

  const progress = getOnboardingProgress(storeResult.data ?? {}, {
    categoryCount: categoryResult.count ?? 0,
    itemWithImageCount: itemImageResult.count ?? 0,
  });

  return (
    <DashboardPage>
      <PageHeader
        title={dict.onboarding.pageTitle}
        description={dict.onboarding.pageSubtitle}
      />

      <ul className="space-y-3">
        {progress.steps.map((step) => {
          const stepDict =
            dict.onboarding.steps[
              step.id as keyof typeof dict.onboarding.steps
            ];
          const isManual = MANUAL_STEP_IDS.has(step.id);
          const showDone = step.complete && !isManual;

          return (
            <li key={step.id} className={`${dash.card} p-4 sm:p-5`}>
              <div className="flex items-start gap-3 sm:gap-4">
                <span
                  className="mt-0.5 shrink-0 text-lg leading-none"
                  aria-hidden
                >
                  {step.complete ? "✅" : "⭕"}
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-stone-900">
                    {stepDict.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    {stepDict.description}
                  </p>
                </div>

                <div className="shrink-0">
                  {showDone ? (
                    <span className="text-sm font-medium text-stone-400">
                      {dict.onboarding.done} ✓
                    </span>
                  ) : (
                    <Link
                      href={step.href}
                      className={`${dash.secondaryBtn} !min-h-9 !px-3.5 !py-2 text-xs`}
                    >
                      {dict.onboarding.goToStep} →
                    </Link>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardPage>
  );
}
