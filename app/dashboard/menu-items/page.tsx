import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteMenuItemButton } from "@/components/dashboard/delete-menu-item-button";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

export default async function DashboardMenuItemsPage() {
  const supabase = await createClient();
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Menu Items</h1>
        <p>No store is linked to this account.</p>
      </main>
    );
  }

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("id", current.profile.store_id)
    .single();

  if (storeError || !store) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Menu Items</h1>
        <p>Could not load your store.</p>
      </main>
    );
  }

  const { data: menuItems, error: menuItemsError } = await supabase
    .from("menu_items")
    .select("*, menu_categories(name)")
    .eq("store_id", store.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (menuItemsError) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Menu Items</h1>
        <p>Could not load menu items.</p>
        <pre>{JSON.stringify(menuItemsError, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{store.name} Menu Items</h1>
          <p className="mt-2 text-slate-600">
            Public menu: /{store.slug}/menu
          </p>
        </div>

        <Link
          href="/dashboard/menu-items/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Add Menu Item
        </Link>
      </div>

      {!menuItems || menuItems.length === 0 ? (
        <p>No menu items found yet.</p>
      ) : (
        <div className="space-y-4">
          {menuItems.map((item) => (
            <div key={item.id} className="rounded-xl border p-4 shadow-sm">
              <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                <div>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-40 w-40 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-lg border text-sm text-slate-500">
                      No Image
                    </div>
                  )}
                </div>

                <div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <p>
                      <strong>Name:</strong> {item.name}
                    </p>
                    <p>
                      <strong>Slug:</strong> {item.slug}
                    </p>
                    <p>
                      <strong>Price:</strong> ₪{item.price}
                    </p>
                    <p>
                      <strong>Category:</strong>{" "}
                      {(item.menu_categories as { name?: string } | null)?.name ??
                        "Uncategorized"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {item.is_active ? "Active" : "Inactive"}
                    </p>
                    <p>
                      <strong>Featured:</strong>{" "}
                      {item.is_featured ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Sort Order:</strong> {item.sort_order}
                    </p>
                  </div>

                  {item.description && (
                    <p className="mt-3 text-sm text-slate-600">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/dashboard/menu-items/${item.id}/edit`}
                      className="rounded-lg border px-4 py-2 font-medium"
                    >
                      Edit
                    </Link>

                    <DeleteMenuItemButton menuItemId={item.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
