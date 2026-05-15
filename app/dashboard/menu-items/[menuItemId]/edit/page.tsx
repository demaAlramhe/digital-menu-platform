import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { EditMenuItemForm } from "@/components/dashboard/edit-menu-item-form";

export const dynamic = "force-dynamic";

type EditMenuItemPageProps = {
  params: Promise<{ menuItemId: string }>;
};

export default async function EditMenuItemPage({ params }: EditMenuItemPageProps) {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Edit Menu Item</h1>
        <p>No store is linked to this account.</p>
      </main>
    );
  }

  const { menuItemId } = await params;
  const supabase = await createClient();

  const [{ data: menuItem, error }, { data: categories }] = await Promise.all([
    supabase
      .from("menu_items")
      .select("*")
      .eq("id", menuItemId)
      .eq("store_id", current.profile.store_id)
      .single(),
    supabase
      .from("menu_categories")
      .select("id, name")
      .eq("store_id", current.profile.store_id)
      .order("sort_order", { ascending: true }),
  ]);

  if (error || !menuItem) {
    notFound();
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Edit Menu Item</h1>

        <Link
          href="/dashboard/menu-items"
          className="rounded-lg border px-4 py-2 font-medium"
        >
          Back to Menu Items
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
