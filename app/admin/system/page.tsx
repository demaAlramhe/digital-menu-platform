import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/ui/stat-card";
import { dash } from "@/components/dashboard/ui/styles";
import { SystemIntegrationsTable } from "@/components/admin/system-integrations-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getTranslations } from "@/lib/i18n/server";
import type { Tables } from "@/types/db";

export const dynamic = "force-dynamic";

type Integration = Tables<"system_integrations">;

const PLAN_LABELS: Record<string, string> = {
  small: "صغير",
  medium: "متوسط",
  large: "كبير",
  custom: "مخصص",
};

const SIGNUP_STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  approved: "موافق عليه",
  rejected: "مرفوض",
};

export default async function AdminSystemPage() {
  await requireSuperAdmin();
  const { dict } = await getTranslations();
  const supabase = createAdminClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { data: integrations, error: integrationsError },
    { data: storePlans },
    { data: signupStatuses },
    { count: signupsLast30Days },
  ] = await Promise.all([
    supabase
      .from("system_integrations")
      .select("*")
      .order("expires_at", { ascending: true, nullsFirst: false }),
    supabase.from("stores").select("plan").is("deleted_at", null),
    supabase.from("pending_signups").select("status"),
    supabase
      .from("pending_signups")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  const planCounts = countBy(storePlans ?? [], (row) => row.plan);
  const signupStatusCounts = countBy(signupStatuses ?? [], (row) => row.status);
  const totalStores = (storePlans ?? []).length;

  const sortedIntegrations = sortIntegrations(integrations ?? []);

  return (
    <AppShell title={dict.nav.system} subtitle="تكاملات المنصة ونظرة على الزبائن">
      <div className="space-y-6">
        <Card>
          <div className="space-y-4">
            <h2 className={dash.sectionTitle}>الخدمات المربوطة</h2>
            {integrationsError ? (
              <p className="text-sm text-red-600">تعذّر تحميل الخدمات المربوطة.</p>
            ) : (
              <SystemIntegrationsTable integrations={sortedIntegrations} />
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div>
              <h2 className={dash.sectionTitle}>نظرة عامة على الزباين</h2>
              <p className={dash.sectionDesc}>
                أعداد حقيقية من المتاجر النشطة وطلبات التسجيل.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div data-testid="stat-total-stores">
                <StatCard
                  label="إجمالي المتاجر"
                  value={totalStores}
                  tone="default"
                />
              </div>
              {(["small", "medium", "large", "custom"] as const).map((plan) => (
                <div key={plan} data-testid={`stat-plan-${plan}`}>
                  <StatCard
                    label={`باقة ${PLAN_LABELS[plan]}`}
                    value={planCounts[plan] ?? 0}
                    tone="info"
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(["pending", "approved", "rejected"] as const).map((status) => (
                <div key={status} data-testid={`stat-signups-${status}`}>
                  <StatCard
                    label={`طلبات: ${SIGNUP_STATUS_LABELS[status]}`}
                    value={signupStatusCounts[status] ?? 0}
                    tone={
                      status === "pending"
                        ? "warning"
                        : status === "approved"
                          ? "success"
                          : "muted"
                    }
                  />
                </div>
              ))}
              <div data-testid="stat-signups-last-30">
                <StatCard
                  label="طلبات آخر 30 يوماً"
                  value={signupsLast30Days ?? 0}
                  tone="default"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h2 className={dash.sectionTitle}>الدفع</h2>
            <p className={dash.sectionDesc}>
              لا يوجد معالج دفع متصل حتى الآن. سيتم تفعيل هذه المنطقة بعد اختيار
              مزوّد الدفع.
            </p>
            <button type="button" className={dash.primaryBtn} disabled>
              ربط معالج الدفع قريباً
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function countBy<T>(
  rows: T[],
  keyFn: (row: T) => string
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const key = keyFn(row);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function sortIntegrations(rows: Integration[]): Integration[] {
  return [...rows].sort((a, b) => {
    if (!a.expires_at && !b.expires_at) return 0;
    if (!a.expires_at) return 1;
    if (!b.expires_at) return -1;
    return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
  });
}
