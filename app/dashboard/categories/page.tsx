import Link from "next/link";
import { DeleteCategoryButton } from "@/components/dashboard/delete-category-button";
import { SuccessBanner } from "@/components/dashboard/success-banner";
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

type DashboardCategoriesPageProps = {
  searchParams: Promise<{ success?: string }>;
};

function buildItemCountByCategory(
  rows: { category_id: string | null }[] | null
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of rows ?? []) {
    if (!row.category_id) continue;
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }

  return counts;
}

export default async function DashboardCategoriesPage({
  searchParams,
}: DashboardCategoriesPageProps) {
  const { success } = await searchParams;
  const storeId = await requireOwnerStoreId();
  const supabase = getOwnerStoreAdminClient();
  const { dict } = await getTranslations();

  const successMessage =
    success === "created"
      ? dict.categories.createSuccess
      : success === "updated"
        ? dict.categories.updateSuccess
        : null;

  const [{ data: categories, error }, { data: menuItemRows }] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*")
      .eq("store_id", storeId)
      .order("sort_order", { ascending: true }),
    supabase.from("menu_items").select("category_id").eq("store_id", storeId),
  ]);

  if (error) {
    return (
      <DashboardPage>
        <PageHeader title={dict.categories.title} />
        <p className="text-stone-600">{dict.categories.loadError}</p>
      </DashboardPage>
    );
  }

  const itemCountByCategory = buildItemCountByCategory(menuItemRows);

  return (
    <DashboardPage>
      {successMessage && <SuccessBanner message={successMessage} />}

      <PageHeader
        title={dict.categories.title}
        action={<PrimaryLink href="/dashboard/categories/new">{dict.categories.add}</PrimaryLink>}
      />

      {!categories || categories.length === 0 ? (
        <EmptyState
          title={dict.categories.empty}
          action={
            <PrimaryLink href="/dashboard/categories/new">{dict.categories.add}</PrimaryLink>
          }
        />
      ) : (
        <ul className="space-y-3">
          {categories.map((category) => {
            const itemCount = itemCountByCategory.get(category.id) ?? 0;

            return (
              <li
                key={category.id}
                className={`${dash.card} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-stone-900">{category.name}</h2>
                    <StatusBadge
                      active={category.is_active}
                      activeLabel={dict.common.active}
                      inactiveLabel={dict.common.inactive}
                    />
                  </div>
                  <p className="mt-1 font-mono text-xs text-stone-500">{category.slug}</p>
                  <p className="mt-2 text-sm text-stone-600">
                    {formatMessage(dict.categories.itemsCount, { count: itemCount })}
                    <span className="mx-2 text-stone-300" aria-hidden>
                      ·
                    </span>
                    {dict.common.sortOrder}: {category.sort_order}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/dashboard/menu-items?categoryId=${category.id}`}
                    className={dash.secondaryBtn}
                  >
                    {dict.categories.viewItems}
                  </Link>
                  <Link
                    href={`/dashboard/categories/${category.id}/edit`}
                    className={dash.secondaryBtn}
                  >
                    {dict.common.edit}
                  </Link>
                  <DeleteCategoryButton categoryId={category.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardPage>
  );
}
