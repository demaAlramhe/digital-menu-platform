import { NewMenuItemForm } from "@/components/dashboard/new-menu-item-form";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { PageHeader } from "@/components/dashboard/ui/page-header";
import { SecondaryLink } from "@/components/dashboard/ui/buttons";
import {
  getOwnerStoreAdminClient,
  requireOwnerStoreId,
} from "@/lib/data/owner-store";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type NewMenuItemPageProps = {
  searchParams: Promise<{ categoryId?: string }>;
};

export default async function NewMenuItemPage({ searchParams }: NewMenuItemPageProps) {
  const storeId = await requireOwnerStoreId();
  const supabase = getOwnerStoreAdminClient();
  const { dict } = await getTranslations();
  const { categoryId: categoryIdParam } = await searchParams;

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("id, name")
    .eq("store_id", storeId)
    .order("sort_order", { ascending: true });

  const categoryList = categories ?? [];
  const defaultCategoryId = categoryList.some((c) => c.id === categoryIdParam)
    ? categoryIdParam
    : undefined;

  return (
    <DashboardPage>
      <PageHeader
        title={dict.menuItems.addTitle}
        action={
          <SecondaryLink href="/dashboard/menu-items">
            {dict.menuItems.backToList}
          </SecondaryLink>
        }
      />
      <NewMenuItemForm
        categories={categoryList.map((c) => ({
          id: c.id,
          name: c.name,
        }))}
        defaultCategoryId={defaultCategoryId}
      />
    </DashboardPage>
  );
}
