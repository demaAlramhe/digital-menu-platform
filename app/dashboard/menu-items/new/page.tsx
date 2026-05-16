import { NewMenuItemForm } from "@/components/dashboard/new-menu-item-form";
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
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">{dict.menuItems.addTitle}</h1>
      <NewMenuItemForm
        categories={(categories ?? []).map((c) => ({
          id: c.id,
          name: c.name,
        }))}
      />
    </main>
  );
}
