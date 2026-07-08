import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { createAdminClient } from "../../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AdminUserRoleSelect } from "@/components/admin/admin-user-role-select";
import { AdminUserStoreSelect } from "@/components/admin/admin-user-store-select";
import { AdminUserProfileEdit } from "@/components/admin/admin-user-profile-edit";
import { AdminUserPasswordChange } from "@/components/admin/admin-user-password-change";
import { AdminUserDeleteButton } from "@/components/admin/admin-user-delete-button";
import { StatCard } from "@/components/dashboard/ui/stat-card";
import { RoleBadge } from "@/components/dashboard/ui/role-badge";
import { dash } from "@/components/dashboard/ui/styles";
import { getTranslations } from "@/lib/i18n/server";

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

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const current = await requireSuperAdmin();
  const { dict } = await getTranslations();
  const currentUserId = current.user.id;

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

  const isLastSuperAdmin = counters.super_admin <= 1;

  return (
    <AppShell title={dict.admin.manageUsers} subtitle={dict.admin.usersTitle}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={dict.admin.totalUsers} value={counters.total} />
          <StatCard
            label={dict.roles.superAdmin}
            value={counters.super_admin}
            tone="info"
          />
          <StatCard
            label={dict.roles.storeOwner}
            value={counters.store_owner}
            tone="success"
          />
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className={dash.sectionTitle}>{dict.admin.usersTitle}</h2>

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
                      className={isActive ? dash.filterChipActive : dash.filterChip}
                    >
                      {filter.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <form action="/admin/users" className="flex flex-wrap gap-2">
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
                className={`${dash.input} min-w-[min(100%,18rem)] flex-1`}
              />
              <button type="submit" className={dash.primaryBtn}>
                {dict.common.search}
              </button>
              <Link
                href={selectedRole === "all" ? "/admin/users" : `/admin/users?role=${selectedRole}`}
                className={dash.secondaryBtn}
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
                {finalUsers.map((user) => {
                  const displayName = user.full_name ?? user.email ?? "—";
                  const isSelf = user.id === currentUserId;
                  const cannotDeleteLastAdmin =
                    user.role === "super_admin" && isLastSuperAdmin;
                  const deleteDisabled = isSelf || cannotDeleteLastAdmin;
                  const deleteDisabledReason = isSelf
                    ? dict.admin.cannotDeleteSelf
                    : cannotDeleteLastAdmin
                      ? dict.admin.cannotDeleteLastSuperAdmin
                      : undefined;

                  return (
                  <div key={user.id} className={`${dash.card} p-5 sm:p-6`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900">
                          {displayName}
                        </h3>
                        <p className="mt-0.5 text-sm text-stone-600">{user.email ?? "—"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminUserProfileEdit
                          userId={user.id}
                          initialFullName={user.full_name}
                          initialEmail={user.email}
                        />
                        <AdminUserPasswordChange
                          userId={user.id}
                          userLabel={displayName}
                        />
                        <AdminUserDeleteButton
                          userId={user.id}
                          userLabel={displayName}
                          disabled={deleteDisabled}
                          disabledReason={deleteDisabledReason}
                        />
                        <RoleBadge role={user.role} dict={dict} />
                      </div>
                    </div>

                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className={dash.eyebrow}>{dict.qr.store}</dt>
                        <dd className="mt-1 text-stone-800">{user.store_name ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className={dash.eyebrow}>{dict.common.slug}</dt>
                        <dd className="mt-1 font-mono text-xs text-stone-600">
                          {user.store_slug ?? "—"}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className={dash.eyebrow}>{dict.roles.userId}</dt>
                        <dd className="mt-1 font-mono text-xs text-stone-600">{user.id}</dd>
                      </div>
                    </dl>

                    {user.role === "store_owner" && !user.store_id && (
                      <div className="mt-4 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
                        {dict.roles.unassignedWarning}
                      </div>
                    )}

                    <div className={`${dash.cardInset} mt-4 grid gap-4 p-4 md:grid-cols-2`}>
                      <div>
                        <p className="mb-2 text-sm font-medium text-stone-700">
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
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}