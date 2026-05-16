import Link from "next/link";
import { notFound } from "next/navigation";
import { EditCategoryForm } from "@/components/dashboard/edit-category-form";
import {
  getOwnerStoreAdminClient,
  requireOwnerStoreId,
} from "@/lib/data/owner-store";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type EditCategoryPageProps = {
  params: Promise<{ categoryId: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const storeId = await requireOwnerStoreId();
  const { dict } = await getTranslations();
  const { categoryId } = await params;
  const supabase = getOwnerStoreAdminClient();

  const { data: category, error } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("id", categoryId)
    .eq("store_id", storeId)
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
