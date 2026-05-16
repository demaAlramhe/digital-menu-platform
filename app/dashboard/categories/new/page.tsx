import { requireStoreOwner } from "@/lib/auth/require-store-owner";
import { NewCategoryForm } from "@/components/dashboard/new-category-form";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireStoreOwner();
  const { dict } = await getTranslations();

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">{dict.categories.addTitle}</h1>
      <NewCategoryForm />
    </main>
  );
}
