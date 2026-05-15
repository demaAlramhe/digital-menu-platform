import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AdminCreateStoreForm } from "@/components/admin/admin-create-store-form";
import { AdminStoreStatusButton } from "@/components/admin/admin-store-status-button";
import { createAdminClient } from "../../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getRoleLabel } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n";

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

function statusLabel(status: string | null, dict: Dictionary) {
  if (status === "active") return dict.common.statusActive;
  if (status === "inactive") return dict.common.statusInactive;
  if (status === "archived") return dict.common.statusArchived;
  return status ?? "—";
}

function StatusBadge({
  status,
  dict,
}: {
  status: string | null;
  dict: Dictionary;
}) {
  const styles =
    status === "active"
      ? { backgroundColor: "#dcfce7", color: "#166534" }
      : status === "inactive"
      ? { backgroundColor: "#fee2e2", color: "#991b1b" }
      : { backgroundColor: "#e5e7eb", color: "#374151" };

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={styles}
    >
      {statusLabel(status, dict)}
    </span>
  );
}

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

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.totalStores}</p>
              <p className="text-3xl font-bold text-slate-900">{counters.total}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.activeStores}</p>
              <p className="text-3xl font-bold text-green-700">{counters.active}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.inactiveStores}</p>
              <p className="text-3xl font-bold text-red-700">{counters.inactive}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.archivedStores}</p>
              <p className="text-3xl font-bold text-slate-700">{counters.archived}</p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">{dict.admin.storesTitle}</h2>

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
                      className="rounded-lg px-4 py-2 text-sm font-medium"
                      style={{
                        backgroundColor: isActive ? "#111827" : "#ffffff",
                        color: isActive ? "#ffffff" : "#111827",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      {filter.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <form action="/admin/stores" className="flex flex-wrap gap-3">
              <input type="hidden" name="status" value={selectedStatus === "all" ? "" : selectedStatus} />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder={`${dict.common.name}, ${dict.common.slug}...`}
                className="min-w-[280px] flex-1 rounded-lg border px-3 py-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-white"
              >
                {dict.common.search}
              </button>
              <Link
                href={selectedStatus === "all" ? "/admin/stores" : `/admin/stores?status=${selectedStatus}`}
                className="rounded-lg border px-4 py-2 font-medium"
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
                  <div
                    key={store.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="grid gap-2 md:grid-cols-2">
                      <p>
                        <strong>{dict.common.name}:</strong> {store.name}
                      </p>
                      <p>
                        <strong>{dict.common.slug}:</strong> {store.slug}
                      </p>
                      <p>
                        <strong>{dict.common.email}:</strong> {store.email ?? "-"}
                      </p>
                      <p>
                        <strong>{dict.common.phone}:</strong> {store.phone ?? "-"}
                      </p>
                      <p>
                        <strong>{dict.common.active}:</strong>{" "}
                        <StatusBadge status={store.status} dict={dict} />
                      </p>
                      <p>
                        <strong>{dict.roles.createdAt}:</strong>{" "}
                        {store.created_at
                          ? new Date(store.created_at).toLocaleString()
                          : "-"}
                      </p>
                      <p className="md:col-span-2">
                        <strong>{dict.common.address}:</strong> {store.address ?? "-"}
                      </p>
                    </div>

                    <div className="mt-4 rounded-lg bg-slate-50 p-4">
                      <h3 className="mb-2 font-semibold">{dict.roles.ownerSection}</h3>
                      <div className="grid gap-2 md:grid-cols-2">
                        <p>
                          <strong>{dict.common.name}:</strong> {store.owner_name ?? "-"}
                        </p>
                        <p>
                          <strong>{dict.common.email}:</strong> {store.owner_email ?? "-"}
                        </p>
                        <p>
                          <strong>{dict.roles.label}:</strong>{" "}
                          {getRoleLabel(store.owner_role, dict)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Link
                        href={`/admin/stores/${store.id}`}
                        className="rounded-lg border px-4 py-2 font-medium"
                      >
                        {dict.common.edit}
                      </Link>

                      <AdminStoreStatusButton
                        storeId={store.id}
                        currentStatus={store.status}
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