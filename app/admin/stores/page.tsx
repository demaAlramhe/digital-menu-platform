import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AdminCreateStoreForm } from "@/components/admin/admin-create-store-form";
import { AdminStoreDeleteButton } from "@/components/admin/admin-store-delete-button";
import { AdminStoreStatusButton } from "@/components/admin/admin-store-status-button";
import { PrimaryLink } from "@/components/dashboard/ui/buttons";
import { StatCard } from "@/components/dashboard/ui/stat-card";
import { StoreStatusBadge } from "@/components/dashboard/ui/store-status-badge";
import { dash } from "@/components/dashboard/ui/styles";
import { createAdminClient } from "../../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getRoleLabel } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type StoreWithOwner = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  address: string | null;
  created_at: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_role: string | null;
};

type AdminStoresPageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminStoresPage({
  searchParams,
}: AdminStoresPageProps) {
  await requireSuperAdmin();
  const { dict } = await getTranslations();

  const FILTERS = [
    { label: dict.admin.storesTitle, value: "all" },
    { label: dict.common.statusActive, value: "active" },
    { label: dict.common.statusInactive, value: "inactive" },
    { label: dict.common.statusArchived, value: "archived" },
  ];

  const { status, q } = await searchParams;
  const selectedStatus =
    status && ["active", "inactive", "archived"].includes(status)
      ? status
      : "all";

  const searchQuery = q?.trim().toLowerCase() ?? "";

  const supabase = createAdminClient();

  const { data: allStores, error: allStoresError } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  const counters = {
    total: allStores?.length ?? 0,
    active: allStores?.filter((store) => store.status === "active").length ?? 0,
    inactive:
      allStores?.filter((store) => store.status === "inactive").length ?? 0,
    archived:
      allStores?.filter((store) => store.status === "archived").length ?? 0,
  };

  const statusFilteredStores =
    selectedStatus === "all"
      ? allStores ?? []
      : (allStores ?? []).filter((store) => store.status === selectedStatus);

  let storesWithOwners: StoreWithOwner[] = [];

  if (statusFilteredStores.length > 0) {
    const storeIds = statusFilteredStores.map((store) => store.id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("full_name, role, store_id, id")
      .in("store_id", storeIds);

    let authUsersMap: Record<string, string> = {};

    if (!profilesError && profiles && profiles.length > 0) {
      const userIds = profiles.map((profile) => profile.id);

      const { data: authUsersData, error: authUsersError } =
        await supabase.auth.admin.listUsers();

      if (!authUsersError && authUsersData?.users) {
        authUsersMap = Object.fromEntries(
          authUsersData.users
            .filter((user) => userIds.includes(user.id))
            .map((user) => [user.id, user.email ?? ""])
        );
      }

      storesWithOwners = statusFilteredStores.map((store) => {
        const ownerProfile =
          profiles.find((profile) => profile.store_id === store.id) ?? null;

        return {
          ...store,
          owner_name: ownerProfile?.full_name ?? null,
          owner_email: ownerProfile ? authUsersMap[ownerProfile.id] ?? null : null,
          owner_role: ownerProfile?.role ?? null,
        };
      });
    } else {
      storesWithOwners = statusFilteredStores.map((store) => ({
        ...store,
        owner_name: null,
        owner_email: null,
        owner_role: null,
      }));
    }
  }

  const finalStores = searchQuery
    ? storesWithOwners.filter((store) => {
        const haystack = [
          store.name,
          store.slug,
          store.email,
          store.phone,
          store.address,
          store.owner_name,
          store.owner_email,
          store.owner_role,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchQuery);
      })
    : storesWithOwners;

  return (
    <AppShell title={dict.admin.manageStores} subtitle={dict.admin.storesTitle}>
      <div className="space-y-6">
        <Card>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">{dict.admin.createStore}</p>
            <AdminCreateStoreForm />
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={dict.admin.totalStores} value={counters.total} />
          <StatCard
            label={dict.admin.activeStores}
            value={counters.active}
            tone="success"
          />
          <StatCard
            label={dict.admin.inactiveStores}
            value={counters.inactive}
            tone="danger"
          />
          <StatCard
            label={dict.admin.archivedStores}
            value={counters.archived}
            tone="muted"
          />
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className={dash.sectionTitle}>{dict.admin.storesTitle}</h2>

              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => {
                  const isActive = selectedStatus === filter.value;
                  const hrefBase =
                    filter.value === "all"
                      ? "/admin/stores"
                      : `/admin/stores?status=${filter.value}`;

                  const href =
                    searchQuery.length > 0
                      ? `${hrefBase}${hrefBase.includes("?") ? "&" : "?"}q=${encodeURIComponent(
                          searchQuery
                        )}`
                      : hrefBase;

                  return (
                    <Link
                      key={filter.value}
                      href={href}
                      className={isActive ? dash.filterChipActive : dash.filterChip}
                    >
                      {filter.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <form action="/admin/stores" className="flex flex-wrap gap-2">
              <input type="hidden" name="status" value={selectedStatus === "all" ? "" : selectedStatus} />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder={`${dict.common.name}, ${dict.common.slug}...`}
                className={`${dash.input} min-w-[min(100%,18rem)] flex-1`}
              />
              <button type="submit" className={dash.primaryBtn}>
                {dict.common.search}
              </button>
              <Link
                href={selectedStatus === "all" ? "/admin/stores" : `/admin/stores?status=${selectedStatus}`}
                className={dash.secondaryBtn}
              >
                {dict.common.clear}
              </Link>
            </form>

            {allStoresError ? (
              <div>
                <p className="text-sm text-red-600">{dict.common.loadStoreError}</p>
                <pre className="mt-2 text-xs text-slate-600">
                  {JSON.stringify(allStoresError, null, 2)}
                </pre>
              </div>
            ) : !finalStores || finalStores.length === 0 ? (
              <p className="text-sm text-slate-600">{dict.admin.noData}</p>
            ) : (
              <div className="space-y-4">
                {finalStores.map((store) => (
                  <div key={store.id} className={`${dash.card} p-5 sm:p-6`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900">{store.name}</h3>
                        <p className="mt-0.5 font-mono text-xs text-stone-500">{store.slug}</p>
                      </div>
                      <StoreStatusBadge
                        status={store.status}
                        activeLabel={dict.common.statusActive}
                        inactiveLabel={dict.common.statusInactive}
                        archivedLabel={dict.common.statusArchived}
                      />
                    </div>

                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className={dash.eyebrow}>{dict.common.email}</dt>
                        <dd className="mt-1 text-stone-800">{store.email ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className={dash.eyebrow}>{dict.common.phone}</dt>
                        <dd className="mt-1 text-stone-800">{store.phone ?? "—"}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className={dash.eyebrow}>{dict.common.address}</dt>
                        <dd className="mt-1 text-stone-800">{store.address ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className={dash.eyebrow}>{dict.roles.createdAt}</dt>
                        <dd className="mt-1 text-stone-800">
                          {store.created_at
                            ? new Date(store.created_at).toLocaleString()
                            : "—"}
                        </dd>
                      </div>
                    </dl>

                    <div className={`${dash.cardInset} mt-4 p-4`}>
                      <h4 className="text-sm font-semibold text-stone-900">
                        {dict.roles.ownerSection}
                      </h4>
                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs font-medium text-stone-500">{dict.common.name}</dt>
                          <dd className="mt-0.5 text-stone-800">{store.owner_name ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-stone-500">{dict.common.email}</dt>
                          <dd className="mt-0.5 text-stone-800">{store.owner_email ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-stone-500">{dict.roles.label}</dt>
                          <dd className="mt-0.5 text-stone-800">
                            {getRoleLabel(store.owner_role, dict)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                      <PrimaryLink href={`/admin/stores/${store.id}`}>
                        {dict.common.edit}
                      </PrimaryLink>
                      <AdminStoreStatusButton
                        storeId={store.id}
                        currentStatus={store.status}
                      />
                      <AdminStoreDeleteButton
                        storeId={store.id}
                        storeName={store.name}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}