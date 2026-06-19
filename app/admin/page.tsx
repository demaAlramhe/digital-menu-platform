import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/ui/stat-card";
import { PrimaryLink, SecondaryLink } from "@/components/dashboard/ui/buttons";
import { dash } from "@/components/dashboard/ui/styles";
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

  const topStoreByCategories =
    [...storeSummaries].sort((a, b) => b.categories_count - a.categories_count)[0] ??
    null;

  return (
    <AppShell title={dict.admin.overviewTitle} subtitle={dict.admin.overviewSubtitle}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label={dict.admin.totalStores} value={totalStores ?? 0} />
        <StatCard
          label={dict.admin.activeStores}
          value={activeStores ?? 0}
          tone="success"
        />
        <StatCard
          label={dict.admin.inactiveStores}
          value={inactiveStores ?? 0}
          tone="danger"
        />
        <StatCard
          label={dict.admin.archivedStores}
          value={archivedStores ?? 0}
          tone="muted"
        />
        <StatCard label={dict.admin.totalUsers} value={totalUsers ?? 0} tone="info" />
        <StatCard
          label={dict.admin.menuItems}
          value={totalMenuItems ?? 0}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className={dash.sectionTitle}>{dict.admin.menuCategories}</h2>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark tabular-nums">
            {totalCategories ?? 0}
          </p>

          <div className="mt-5 border-t border-brand-secondary/30 pt-4">
            <h3 className="text-sm font-semibold text-brand-dark">
              {dict.admin.topByCategories}
            </h3>
            <TopStoreHighlight
              store={topStoreByCategories}
              metricLabel={
                topStoreByCategories
                  ? formatMessage(dict.admin.categoriesCountSingle, {
                      count: topStoreByCategories.categories_count,
                    })
                  : undefined
              }
              noDataLabel={dict.admin.noData}
            />
          </div>
        </Card>

        <Card>
          <h2 className={dash.sectionTitle}>{dict.admin.topByItems}</h2>
          <TopStoreHighlight
            store={topStoreByMenuItems}
            metricLabel={
              topStoreByMenuItems
                ? formatMessage(dict.admin.itemsCount, {
                    count: topStoreByMenuItems.menu_items_count,
                  })
                : undefined
            }
            noDataLabel={dict.admin.noData}
          />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className={dash.sectionTitle}>{dict.admin.quickActions}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryLink href="/admin/stores">{dict.admin.manageStores}</PrimaryLink>
            <SecondaryLink href="/admin/users">{dict.admin.manageUsers}</SecondaryLink>
          </div>
        </Card>

        <Card>
          <h2 className={dash.sectionTitle}>{dict.admin.storesSnapshot}</h2>
          {!storeSummaries.length ? (
            <AdminNoData message={dict.admin.noData} />
          ) : (
            <ul className="mt-4 space-y-3">
              {storeSummaries
                .sort((a, b) => b.menu_items_count - a.menu_items_count)
                .slice(0, 3)
                .map((store) => (
                  <li key={store.store_id} className={`${dash.cardInset} p-3.5`}>
                    <p className="font-medium text-stone-900">{store.store_name}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {formatMessage(dict.admin.categoriesCount, {
                        items: store.menu_items_count,
                        categories: store.categories_count,
                      })}
                    </p>
                    <Link
                      href={`/${store.store_slug}/menu`}
                      className="mt-1 inline-block font-mono text-xs text-sky-700 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      /{store.store_slug}/menu
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function AdminNoData({ message }: { message: string }) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed border-brand-secondary/50 bg-brand-secondary/10 px-4 py-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-stone-500 ring-1 ring-brand-secondary/40"
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 7h16M4 12h10M4 17h7"
          />
        </svg>
      </span>
      <p className="text-sm leading-relaxed text-stone-600">{message}</p>
    </div>
  );
}

function TopStoreHighlight({
  store,
  metricLabel,
  noDataLabel,
}: {
  store: StoreMenuSummary | null;
  metricLabel?: string;
  noDataLabel: string;
}) {
  if (!store) {
    return <AdminNoData message={noDataLabel} />;
  }

  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-xl font-semibold tracking-tight text-stone-900">
        {store.store_name}
      </p>
      {metricLabel && <p className="text-sm text-stone-600">{metricLabel}</p>}
      <p className="font-mono text-sm text-stone-500">/{store.store_slug}/menu</p>
    </div>
  );
}
