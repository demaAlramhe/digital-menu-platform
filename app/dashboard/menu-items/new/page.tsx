import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { NewMenuItemForm } from "@/components/dashboard/new-menu-item-form";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewMenuItemPage() {
  const current = await getCurrentProfile();
  const { dict } = await getTranslations();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">{dict.menuItems.addTitle}</h1>
        <p>{dict.common.noStore}</p>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("id, name")
    .eq("store_id", current.profile.store_id)
    .order("sort_order", { ascending: true });

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">{dict.menuItems.addTitle}</h1>
      <NewMenuItemForm
        categories={(categories ?? []).map((c) => ({
          id: c.id,
          name: c.name,
        }))}
      />
    </main>
  );
}
