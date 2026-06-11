import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { AdminSignupsTable } from "@/components/admin/admin-signups-table";
import { dash } from "@/components/dashboard/ui/styles";
import { createAdminClient } from "../../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getTranslations } from "@/lib/i18n/server";
import type { PendingSignupRow } from "@/types/db";

export const dynamic = "force-dynamic";

type AdminSignupsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

type SignupWithStore = PendingSignupRow & {
  store_slug: string | null;
};

export default async function AdminSignupsPage({
  searchParams,
}: AdminSignupsPageProps) {
  await requireSuperAdmin();
  const { dict } = await getTranslations();
  const { status } = await searchParams;

  const statusFilter =
    status && ["pending", "approved", "rejected"].includes(status)
      ? (status as "pending" | "approved" | "rejected")
      : "all";

  const supabase = createAdminClient();

  let query = supabase
    .from("pending_signups")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: signups, error } = await query;

  const storeIds = (signups ?? [])
    .map((signup) => signup.approved_store_id)
    .filter((id): id is string => Boolean(id));

  const { data: stores } = storeIds.length
    ? await supabase.from("stores").select("id, slug").in("id", storeIds)
    : { data: [] as { id: string; slug: string }[] };

  const storeSlugMap = Object.fromEntries(
    (stores ?? []).map((store) => [store.id, store.slug])
  );

  const signupsWithStore: SignupWithStore[] = (signups ?? []).map((signup) => ({
    ...signup,
    store_slug: signup.approved_store_id
      ? storeSlugMap[signup.approved_store_id] ?? null
      : null,
  }));

  return (
    <AppShell title={dict.nav.signups} subtitle={dict.admin.signupsSubtitle}>
      <Card>
        <div className="space-y-4">
          <h2 className={dash.sectionTitle}>{dict.nav.signups}</h2>

          {error ? (
            <p className="text-sm text-red-600">{dict.admin.signupsLoadError}</p>
          ) : (
            <AdminSignupsTable
              signups={signupsWithStore}
              statusFilter={statusFilter}
            />
          )}
        </div>
      </Card>
    </AppShell>
  );
}
