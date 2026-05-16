import { NewCategoryForm } from "@/components/dashboard/new-category-form";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { PageHeader } from "@/components/dashboard/ui/page-header";
import { SecondaryLink } from "@/components/dashboard/ui/buttons";
import { requireStoreOwner } from "@/lib/auth/require-store-owner";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireStoreOwner();
  const { dict } = await getTranslations();

  return (
    <DashboardPage>
      <PageHeader
        title={dict.categories.addTitle}
        action={
          <SecondaryLink href="/dashboard/categories">
            {dict.categories.backToList}
          </SecondaryLink>
        }
      />
      <NewCategoryForm />
    </DashboardPage>
  );
}
