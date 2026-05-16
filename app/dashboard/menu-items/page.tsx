import Link from "next/link";
import { DeleteMenuItemButton } from "@/components/dashboard/delete-menu-item-button";
import { SuccessBanner } from "@/components/dashboard/success-banner";
import {
  getOwnerStoreAdminClient,
  requireOwnerStoreId,
} from "@/lib/data/owner-store";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type DashboardMenuItemsPageProps = {
  searchParams: Promise<{ success?: string }>;
};

export default async function DashboardMenuItemsPage({
  searchParams,
}: DashboardMenuItemsPageProps) {
  const { success } = await searchParams;
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
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">{dict.menuItems.title}</h1>
        <p>{dict.common.loadStoreError}</p>
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
        <h1 className="mb-4 text-3xl font-bold">{dict.menuItems.title}</h1>
        <p>{dict.menuItems.loadError}</p>
        <pre>{JSON.stringify(menuItemsError, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main className="p-8">
      {successMessage && <SuccessBanner message={successMessage} />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {store.name} — {dict.menuItems.title}
          </h1>
          <p className="mt-2 text-slate-600">
            {dict.menuItems.publicMenu}: /{store.slug}/menu
          </p>
        </div>

        <Link
          href="/dashboard/menu-items/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          {dict.menuItems.add}
        </Link>
      </div>

      {!menuItems || menuItems.length === 0 ? (
        <p>{dict.menuItems.empty}</p>
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
                      {dict.common.noImage}
                    </div>
                  )}
                </div>

                <div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <p>
                      <strong>{dict.common.name}:</strong> {item.name}
                    </p>
                    <p>
                      <strong>{dict.common.slug}:</strong> {item.slug}
                    </p>
                    <p>
                      <strong>{dict.common.price}:</strong> {dict.common.currency}
                      {item.price}
                    </p>
                    <p>
                      <strong>{dict.common.category}:</strong>{" "}
                      {(item.menu_categories as { name?: string } | null)?.name ??
                        dict.common.uncategorized}
                    </p>
                    <p>
                      <strong>{dict.common.active}:</strong>{" "}
                      {item.is_active ? dict.common.active : dict.common.inactive}
                    </p>
                    <p>
                      <strong>{dict.common.featured}:</strong>{" "}
                      {item.is_featured ? dict.common.active : dict.common.inactive}
                    </p>
                    <p>
                      <strong>{dict.common.sortOrder}:</strong> {item.sort_order}
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
                      {dict.common.edit}
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
