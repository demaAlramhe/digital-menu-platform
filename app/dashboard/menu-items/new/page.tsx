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

export default async function NewMenuItemPage() {
  const storeId = await requireOwnerStoreId();
  const supabase = getOwnerStoreAdminClient();
  const { dict } = await getTranslations();

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("id, name")
    .eq("store_id", storeId)
    .order("sort_order", { ascending: true });

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
        categories={(categories ?? []).map((c) => ({
          id: c.id,
          name: c.name,
        }))}
      />
    </DashboardPage>
  );
}
