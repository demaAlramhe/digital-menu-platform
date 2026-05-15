import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { createAdminClient } from "../../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AdminUserRoleSelect } from "@/components/admin/admin-user-role-select";
import { AdminUserStoreSelect } from "@/components/admin/admin-user-store-select";
import { getRoleLabel } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  full_name: string | null;
  role: string | null;
  store_id: string | null;
  email: string | null;
  store_name: string | null;
  store_slug: string | null;
};

type StoreOption = {
  id: string;
  name: string;
  slug: string;
};

type AdminUsersPageProps = {
  searchParams: Promise<{ role?: string; q?: string }>;
};

function RoleBadge({
  role,
  dict,
}: {
  role: string | null;
  dict: Dictionary;
}) {
  const styles =
    role === "super_admin"
      ? { backgroundColor: "#dbeafe", color: "#1d4ed8" }
      : role === "store_owner"
      ? { backgroundColor: "#dcfce7", color: "#166534" }
      : { backgroundColor: "#e5e7eb", color: "#374151" };

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={styles}
    >
      {getRoleLabel(role, dict)}
    </span>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await requireSuperAdmin();
  const { dict } = await getTranslations();

  const ROLE_FILTERS = [
    { label: dict.roles.all, value: "all" },
    { label: dict.roles.superAdmin, value: "super_admin" },
    { label: dict.roles.storeOwner, value: "store_owner" },
  ];

  const { role, q } = await searchParams;
  const selectedRole =
    role && ["super_admin", "store_owner"].includes(role) ? role : "all";
  const searchQuery = q?.trim().toLowerCase() ?? "";

  const supabase = createAdminClient();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, role, store_id")
    .order("full_name", { ascending: true });

  const { data: allStores } = await supabase
    .from("stores")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const storeOptions: StoreOption[] = allStores ?? [];

  let users: UserRow[] = [];

  if (!profilesError && profiles && profiles.length > 0) {
    const storeIds = profiles
      .map((profile) => profile.store_id)
      .filter((id): id is string => Boolean(id));

    const { data: stores } = storeIds.length
      ? await supabase
          .from("stores")
          .select("id, name, slug")
          .in("id", storeIds)
      : { data: [] as { id: string; name: string; slug: string }[] };

    const storesMap = Object.fromEntries(
      (stores ?? []).map((store) => [store.id, store])
    );

    const { data: authUsersData, error: authUsersError } =
      await supabase.auth.admin.listUsers();

    const authUsersMap =
      !authUsersError && authUsersData?.users
        ? Object.fromEntries(
            authUsersData.users.map((user) => [user.id, user.email ?? ""])
          )
        : {};

    users = profiles.map((profile) => {
      const store = profile.store_id ? storesMap[profile.store_id] : null;

      return {
        id: profile.id,
        full_name: profile.full_name ?? null,
        role: profile.role ?? null,
        store_id: profile.store_id ?? null,
        email: authUsersMap[profile.id] ?? null,
        store_name: store?.name ?? null,
        store_slug: store?.slug ?? null,
      };
    });
  }

  const filteredByRole =
    selectedRole === "all"
      ? users
      : users.filter((user) => user.role === selectedRole);

  const finalUsers = searchQuery
    ? filteredByRole.filter((user) => {
        const haystack = [
          user.full_name,
          user.email,
          user.role,
          user.store_name,
          user.store_slug,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchQuery);
      })
    : filteredByRole;

  const counters = {
    total: users.length,
    super_admin: users.filter((user) => user.role === "super_admin").length,
    store_owner: users.filter((user) => user.role === "store_owner").length,
  };

  return (
    <AppShell title={dict.admin.manageUsers} subtitle={dict.admin.usersTitle}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.totalUsers}</p>
              <p className="text-3xl font-bold text-slate-900">{counters.total}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.roles.superAdmin}</p>
              <p className="text-3xl font-bold text-blue-700">
                {counters.super_admin}
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.roles.storeOwner}</p>
              <p className="text-3xl font-bold text-green-700">
                {counters.store_owner}
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">{dict.admin.usersTitle}</h2>

              <div className="flex flex-wrap gap-2">
                {ROLE_FILTERS.map((filter) => {
                  const isActive = selectedRole === filter.value;
                  const hrefBase =
                    filter.value === "all"
                      ? "/admin/users"
                      : `/admin/users?role=${filter.value}`;

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

            <form action="/admin/users" className="flex flex-wrap gap-3">
              <input
                type="hidden"
                name="role"
                value={selectedRole === "all" ? "" : selectedRole}
              />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder={`${dict.common.name}, ${dict.common.email}...`}
                className="min-w-[280px] flex-1 rounded-lg border px-3 py-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-white"
              >
                {dict.common.search}
              </button>
              <Link
                href={selectedRole === "all" ? "/admin/users" : `/admin/users?role=${selectedRole}`}
                className="rounded-lg border px-4 py-2 font-medium"
              >
                {dict.common.clear}
              </Link>
            </form>

            {profilesError ? (
              <div>
                <p className="text-sm text-red-600">{dict.roles.loadUsersError}</p>
                <pre className="mt-2 text-xs text-slate-600">
                  {JSON.stringify(profilesError, null, 2)}
                </pre>
              </div>
            ) : finalUsers.length === 0 ? (
              <p className="text-sm text-slate-600">{dict.admin.noData}</p>
            ) : (
              <div className="space-y-4">
                {finalUsers.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="grid gap-2 md:grid-cols-2">
                      <p>
                        <strong>{dict.common.name}:</strong> {user.full_name ?? "-"}
                      </p>
                      <p>
                        <strong>{dict.common.email}:</strong> {user.email ?? "-"}
                      </p>
                      <div className="flex items-center gap-2">
                        <strong>{dict.roles.label}:</strong>
                        <RoleBadge role={user.role} dict={dict} />
                      </div>
                      <p>
                        <strong>{dict.roles.userId}:</strong> {user.id}
                      </p>
                      <p>
                        <strong>{dict.qr.store}:</strong> {user.store_name ?? "-"}
                      </p>
                      <p>
                        <strong>{dict.common.slug}:</strong> {user.store_slug ?? "-"}
                      </p>
                    </div>

                    {user.role === "store_owner" && !user.store_id && (
                      <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                        {dict.roles.unassignedWarning}
                      </div>
                    )}

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">
                          {dict.roles.changeRole}
                        </p>
                        <AdminUserRoleSelect
                          userId={user.id}
                          currentRole={user.role}
                        />
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">
                          {dict.roles.assignStore}
                        </p>
                        <AdminUserStoreSelect
                          userId={user.id}
                          currentStoreId={user.store_id}
                          currentRole={user.role}
                          stores={storeOptions}
                        />
                      </div>
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