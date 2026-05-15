import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { createAdminClient } from "../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { formatMessage } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type StoreMenuSummary = {
  store_id: string;
  store_name: string;
  store_slug: string;
  menu_items_count: number;
  categories_count: number;
};

export default async function AdminPage() {
  await requireSuperAdmin();
  const { dict } = await getTranslations();

  const supabase = createAdminClient();

  const [
    { count: totalStores },
    { count: activeStores },
    { count: inactiveStores },
    { count: archivedStores },
    { count: totalUsers },
    { count: totalMenuItems },
    { count: totalCategories },
    { data: menuItemsData },
    { data: categoriesData },
    { data: storesData },
  ] = await Promise.all([
    supabase.from("stores").select("*", { count: "exact", head: true }),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("status", "inactive"),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("status", "archived"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("menu_items").select("*", { count: "exact", head: true }),
    supabase.from("menu_categories").select("*", { count: "exact", head: true }),
    supabase.from("menu_items").select("store_id"),
    supabase.from("menu_categories").select("store_id"),
    supabase.from("stores").select("id, name, slug"),
  ]);

  const summariesMap = new Map<string, StoreMenuSummary>();

  (storesData ?? []).forEach((store) => {
    summariesMap.set(store.id, {
      store_id: store.id,
      store_name: store.name,
      store_slug: store.slug,
      menu_items_count: 0,
      categories_count: 0,
    });
  });

  (menuItemsData ?? []).forEach((item) => {
    const storeId = item.store_id;
    if (!storeId || !summariesMap.has(storeId)) return;
    summariesMap.get(storeId)!.menu_items_count += 1;
  });

  (categoriesData ?? []).forEach((category) => {
    const storeId = category.store_id;
    if (!storeId || !summariesMap.has(storeId)) return;
    summariesMap.get(storeId)!.categories_count += 1;
  });

  const storeSummaries = Array.from(summariesMap.values());

  const topStoreByMenuItems =
    [...storeSummaries].sort((a, b) => b.menu_items_count - a.menu_items_count)[0] ??
    null;

  return (
    <AppShell title={dict.admin.overviewTitle} subtitle={dict.admin.overviewSubtitle}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.totalStores}</p>
              <p className="text-3xl font-bold text-slate-900">{totalStores ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.activeStores}</p>
              <p className="text-3xl font-bold text-green-700">{activeStores ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.inactiveStores}</p>
              <p className="text-3xl font-bold text-red-700">{inactiveStores ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.archivedStores}</p>
              <p className="text-3xl font-bold text-slate-700">{archivedStores ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.totalUsers}</p>
              <p className="text-3xl font-bold text-blue-700">{totalUsers ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.menuItems}</p>
              <p className="text-3xl font-bold text-amber-700">{totalMenuItems ?? 0}</p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{dict.admin.menuCategories}</p>
              <p className="text-3xl font-bold text-slate-900">{totalCategories ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">{dict.admin.topByItems}</p>
              {topStoreByMenuItems ? (
                <>
                  <p className="text-xl font-bold text-slate-900">
                    {topStoreByMenuItems.store_name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatMessage(dict.admin.itemsCount, {
                      count: topStoreByMenuItems.menu_items_count,
                    })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {dict.admin.publicMenuPath}: /{topStoreByMenuItems.store_slug}/menu
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-600">{dict.admin.noData}</p>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{dict.admin.quickActions}</h2>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/stores"
                  className="rounded-lg border px-4 py-2 font-medium"
                >
                  {dict.admin.manageStores}
                </Link>

                <Link
                  href="/admin/users"
                  className="rounded-lg border px-4 py-2 font-medium"
                >
                  {dict.admin.manageUsers}
                </Link>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">{dict.admin.storesSnapshot}</h2>

              {!storeSummaries.length ? (
                <p className="text-sm text-slate-600">{dict.admin.noData}</p>
              ) : (
                <div className="space-y-3">
                  {storeSummaries
                    .sort((a, b) => b.menu_items_count - a.menu_items_count)
                    .slice(0, 3)
                    .map((store) => (
                      <div
                        key={store.store_id}
                        className="rounded-lg border border-slate-200 p-3"
                      >
                        <p className="font-medium text-slate-900">{store.store_name}</p>
                        <p className="text-sm text-slate-600">
                          {formatMessage(dict.admin.categoriesCount, {
                            items: store.menu_items_count,
                            categories: store.categories_count,
                          })}
                        </p>
                        <p className="text-sm text-slate-600">
                          /{store.store_slug}/menu
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
