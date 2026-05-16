import Link from "next/link";
import { DeleteMenuItemButton } from "@/components/dashboard/delete-menu-item-button";
import { SuccessBanner } from "@/components/dashboard/success-banner";
import { CategoryFilterBanner } from "@/components/dashboard/ui/category-filter-banner";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { EmptyState } from "@/components/dashboard/ui/empty-state";
import { PageHeader } from "@/components/dashboard/ui/page-header";
import { PrimaryLink } from "@/components/dashboard/ui/buttons";
import { StatusBadge } from "@/components/dashboard/ui/status-badge";
import { dash } from "@/components/dashboard/ui/styles";
import {
  getOwnerStoreAdminClient,
  requireOwnerStoreId,
} from "@/lib/data/owner-store";
import { formatMessage } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type DashboardMenuItemsPageProps = {
  searchParams: Promise<{ success?: string; categoryId?: string }>;
};

export default async function DashboardMenuItemsPage({
  searchParams,
}: DashboardMenuItemsPageProps) {
  const { success, categoryId } = await searchParams;
  const storeId = await requireOwnerStoreId();
  const supabase = getOwnerStoreAdminClient();
  const { dict } = await getTranslations();

  const successMessage =
    success === "created"
      ? dict.menuItems.createSuccess
      : success === "updated"
        ? dict.menuItems.updateSuccess
        : null;

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("id", storeId)
    .single();

  if (storeError || !store) {
    return (
      <DashboardPage>
        <PageHeader title={dict.menuItems.title} />
        <p className="text-stone-600">{dict.common.loadStoreError}</p>
      </DashboardPage>
    );
  }

  let activeCategory: { id: string; name: string } | null = null;

  if (categoryId) {
    const { data: category } = await supabase
      .from("menu_categories")
      .select("id, name")
      .eq("id", categoryId)
      .eq("store_id", storeId)
      .maybeSingle();

    if (category) {
      activeCategory = category;
    }
  }

  let menuItemsQuery = supabase
    .from("menu_items")
    .select("*, menu_categories(name)")
    .eq("store_id", store.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (activeCategory) {
    menuItemsQuery = menuItemsQuery.eq("category_id", activeCategory.id);
  }

  const { data: menuItems, error: menuItemsError } = await menuItemsQuery;

  if (menuItemsError) {
    return (
      <DashboardPage>
        <PageHeader title={dict.menuItems.title} />
        <p className="text-stone-600">{dict.menuItems.loadError}</p>
      </DashboardPage>
    );
  }

  const isFiltered = Boolean(activeCategory);
  const emptyTitle = isFiltered ? dict.menuItems.emptyInCategory : dict.menuItems.empty;

  return (
    <DashboardPage>
      {successMessage && <SuccessBanner message={successMessage} />}

      {activeCategory && (
        <CategoryFilterBanner
          label={formatMessage(dict.menuItems.filteredBy, {
            category: activeCategory.name,
          })}
          clearLabel={dict.menuItems.clearFilter}
        />
      )}

      <PageHeader
        eyebrow={store.name}
        title={dict.menuItems.title}
        description={`${dict.menuItems.publicMenu}: /${store.slug}/menu`}
        action={<PrimaryLink href="/dashboard/menu-items/new">{dict.menuItems.add}</PrimaryLink>}
      />

      {!menuItems || menuItems.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          action={
            <PrimaryLink href="/dashboard/menu-items/new">{dict.menuItems.add}</PrimaryLink>
          }
        />
      ) : (
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.id} className={`${dash.card} overflow-hidden`}>
              <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-5">
                <div className="shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-28 w-28 rounded-xl object-cover ring-1 ring-stone-200/80 sm:h-32 sm:w-32"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-stone-100 text-xs font-medium text-stone-500 ring-1 ring-stone-200/80 sm:h-32 sm:w-32">
                      {dict.common.noImage}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-stone-900">{item.name}</h2>
                      <p className="mt-0.5 font-mono text-xs text-stone-500">{item.slug}</p>
                    </div>
                    <p className="rounded-full bg-stone-900 px-3 py-1 text-sm font-bold tabular-nums text-white">
                      {dict.common.currency}
                      {item.price}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge
                      active={item.is_active}
                      activeLabel={dict.common.active}
                      inactiveLabel={dict.common.inactive}
                    />
                    {item.is_featured && (
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
                        {dict.common.featured}
                      </span>
                    )}
                  </div>

                  <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">
                        {dict.common.category}
                      </dt>
                      <dd className="mt-0.5 text-stone-800">
                        {(item.menu_categories as { name?: string } | null)?.name ??
                          dict.common.uncategorized}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">
                        {dict.common.sortOrder}
                      </dt>
                      <dd className="mt-0.5 text-stone-800">{item.sort_order}</dd>
                    </div>
                  </dl>

                  {item.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-600">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                    <Link
                      href={`/dashboard/menu-items/${item.id}/edit`}
                      className={dash.secondaryBtn}
                    >
                      {dict.common.edit}
                    </Link>
                    <DeleteMenuItemButton menuItemId={item.id} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardPage>
  );
}
