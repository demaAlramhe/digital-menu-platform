import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { EditCategoryForm } from "@/components/dashboard/edit-category-form";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type EditCategoryPageProps = {
  params: Promise<{ categoryId: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const current = await getCurrentProfile();
  const { dict } = await getTranslations();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">{dict.categories.editTitle}</h1>
        <p>{dict.common.noStore}</p>
      </main>
    );
  }

  const { categoryId } = await params;
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("id", categoryId)
    .eq("store_id", current.profile.store_id)
    .single();

  if (error || !category) {
    notFound();
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{dict.categories.editTitle}</h1>

        <Link
          href="/dashboard/categories"
          className="rounded-lg border px-4 py-2 font-medium"
        >
          {dict.categories.backToList}
        </Link>
      </div>

      <EditCategoryForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          sortOrder: category.sort_order ?? 0,
          isActive: category.is_active,
        }}
      />
    </main>
  );
}
