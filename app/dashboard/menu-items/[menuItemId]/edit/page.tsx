import { notFound } from "next/navigation";
import { EditMenuItemForm } from "@/components/dashboard/edit-menu-item-form";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { PageHeader } from "@/components/dashboard/ui/page-header";
import { SecondaryLink } from "@/components/dashboard/ui/buttons";
import {
  getOwnerStoreAdminClient,
  requireOwnerStoreId,
} from "@/lib/data/owner-store";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type EditMenuItemPageProps = {
  params: Promise<{ menuItemId: string }>;
};

export default async function EditMenuItemPage({ params }: EditMenuItemPageProps) {
  const storeId = await requireOwnerStoreId();
  const { dict } = await getTranslations();
  const { menuItemId } = await params;
  const supabase = getOwnerStoreAdminClient();

  const [{ data: menuItem, error }, { data: categories }] = await Promise.all([
    supabase
      .from("menu_items")
      .select("*")
      .eq("id", menuItemId)
      .eq("store_id", storeId)
      .single(),
    supabase
      .from("menu_categories")
      .select("id, name")
      .eq("store_id", storeId)
      .order("sort_order", { ascending: true }),
  ]);

  if (error || !menuItem) {
    notFound();
  }

  return (
    <DashboardPage>
      <PageHeader
        title={dict.menuItems.editTitle}
        action={
          <SecondaryLink href="/dashboard/menu-items">
            {dict.menuItems.backToList}
          </SecondaryLink>
        }
      />
      <EditMenuItemForm
        menuItem={{
          id: menuItem.id,
          name: menuItem.name,
          slug: menuItem.slug,
          description: menuItem.description ?? "",
          price: Number(menuItem.price),
          sortOrder: menuItem.sort_order ?? 0,
          categoryId: menuItem.category_id ?? "",
          isActive: menuItem.is_active,
          isFeatured: menuItem.is_featured ?? false,
          imageUrl: menuItem.image_url ?? "",
        }}
        categories={(categories ?? []).map((c) => ({
          id: c.id,
          name: c.name,
        }))}
      />
    </DashboardPage>
  );
}
