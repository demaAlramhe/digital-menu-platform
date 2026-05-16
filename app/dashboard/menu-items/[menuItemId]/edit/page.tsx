import Link from "next/link";
import { notFound } from "next/navigation";
import { EditMenuItemForm } from "@/components/dashboard/edit-menu-item-form";
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
    <main className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{dict.menuItems.editTitle}</h1>

        <Link
          href="/dashboard/menu-items"
          className="rounded-lg border px-4 py-2 font-medium"
        >
          {dict.menuItems.backToList}
        </Link>
      </div>

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
    </main>
  );
}
