import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { StoreQrCard } from "@/components/dashboard/store-qr-card";
import { buildPublicMenuUrl } from "@/lib/utils/public-menu-url";

export const dynamic = "force-dynamic";

export default async function DashboardQrPage() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">QR Code</h1>
        <p>No store is linked to this account.</p>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select("id, name, slug, status")
    .eq("id", current.profile.store_id)
    .single();

  if (error || !store?.slug) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">QR Code</h1>
        <p>Could not load your store.</p>
      </main>
    );
  }

  const menuUrl = await buildPublicMenuUrl(store.slug);

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">QR Code</h1>
      <p className="mb-8 text-slate-600">
        Share this QR code so customers can open your public digital menu.
      </p>

      {store.status !== "active" && (
        <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your store is currently <strong>{store.status}</strong>. The menu link
          may not be visible to the public until the store is active.
        </p>
      )}

      <div className="mb-6">
        <Link
          href="/dashboard/qr/poster"
          className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          Print QR Poster
        </Link>
      </div>

      <StoreQrCard
        storeName={store.name ?? "Your store"}
        storeSlug={store.slug}
        menuUrl={menuUrl}
      />
    </main>
  );
}
