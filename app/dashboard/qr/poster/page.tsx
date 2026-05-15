import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { QrPoster } from "@/components/dashboard/qr-poster";
import { buildPublicMenuUrl } from "@/lib/utils/public-menu-url";

export const dynamic = "force-dynamic";

export default async function DashboardQrPosterPage() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">Print QR Poster</h1>
        <p>No store is linked to this account.</p>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url, phone, primary_color, status")
    .eq("id", current.profile.store_id)
    .single();

  if (error || !store?.slug) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">Print QR Poster</h1>
        <p>Could not load your store.</p>
      </main>
    );
  }

  const menuUrl = await buildPublicMenuUrl(store.slug);

  return (
    <main className="p-8 print:p-0">
      <div className="mb-8 print:hidden">
        <h1 className="mb-2 text-3xl font-bold">Print QR Poster</h1>
        <p className="text-slate-600">
          Print this poster for tables, counters, or walls. Customers scan the QR
          code to open your menu.
        </p>

        {store.status !== "active" && (
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Your store is currently <strong>{store.status}</strong>. The menu
            link may not work for customers until the store is active.
          </p>
        )}
      </div>

      <QrPoster
        storeName={store.name ?? "Your store"}
        menuUrl={menuUrl}
        logoUrl={store.logo_url}
        phone={store.phone}
        primaryColor={store.primary_color ?? "#111827"}
      />
    </main>
  );
}
