import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { NewCategoryForm } from "@/components/dashboard/new-category-form";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const current = await getCurrentProfile();
  const { dict } = await getTranslations();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">{dict.categories.addTitle}</h1>
        <p>{dict.common.noStore}</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">{dict.categories.addTitle}</h1>
      <NewCategoryForm />
    </main>
  );
}
