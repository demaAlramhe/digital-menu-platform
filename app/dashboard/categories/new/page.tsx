import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { NewCategoryForm } from "@/components/dashboard/new-category-form";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">Add Category</h1>
        <p>No store is linked to this account.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Add Category</h1>
      <NewCategoryForm />
    </main>
  );
}
