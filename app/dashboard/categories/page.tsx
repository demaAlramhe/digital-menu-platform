import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteCategoryButton } from "@/components/dashboard/delete-category-button";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function DashboardCategoriesPage() {
  const supabase = await createClient();
  const current = await getCurrentProfile();
  const { dict } = await getTranslations();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">{dict.categories.title}</h1>
        <p>{dict.common.noStore}</p>
      </main>
    );
  }

  const { data: categories, error } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("store_id", current.profile.store_id)
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">{dict.categories.title}</h1>
        <p>{dict.categories.loadError}</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{dict.categories.title}</h1>

        <Link
          href="/dashboard/categories/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          {dict.categories.add}
        </Link>
      </div>

      {!categories || categories.length === 0 ? (
        <p>{dict.categories.empty}</p>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-sm"
            >
              <div>
                <p className="font-semibold">{category.name}</p>
                <p className="text-sm text-slate-600">
                  {dict.common.slug}: {category.slug}
                </p>
                <p className="text-sm text-slate-600">
                  {dict.common.sortOrder}: {category.sort_order} ·{" "}
                  {category.is_active ? dict.common.active : dict.common.inactive}
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/dashboard/categories/${category.id}/edit`}
                  className="rounded-lg border px-4 py-2 font-medium"
                >
                  {dict.common.edit}
                </Link>

                <DeleteCategoryButton categoryId={category.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
