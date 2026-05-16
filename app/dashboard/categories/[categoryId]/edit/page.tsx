import { notFound } from "next/navigation";
import { EditCategoryForm } from "@/components/dashboard/edit-category-form";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { PageHeader } from "@/components/dashboard/ui/page-header";
import { SecondaryLink } from "@/components/dashboard/ui/buttons";
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
    <DashboardPage>
      <PageHeader
        title={dict.categories.editTitle}
        action={
          <SecondaryLink href="/dashboard/categories">
            {dict.categories.backToList}
          </SecondaryLink>
        }
      />
      <EditCategoryForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          sortOrder: category.sort_order ?? 0,
          isActive: category.is_active,
        }}
      />
    </DashboardPage>
  );
}
