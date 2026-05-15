import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { Card } from "@/components/ui/card";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { AdminEditStoreForm } from "@/components/admin/admin-edit-store-form";
import { buildPublicMenuUrl } from "@/lib/utils/public-menu-url";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type AdminStorePageProps = {
  params: Promise<{ storeId: string }>;
};

export default async function AdminStorePage({ params }: AdminStorePageProps) {
  await requireSuperAdmin();
  const { dict } = await getTranslations();

  const { storeId } = await params;
  const supabase = createAdminClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (error || !store) {
    notFound();
  }

  const menuUrl = store.slug ? await buildPublicMenuUrl(store.slug) : null;

  return (
    <AppShell
      title={`${dict.admin.storePageTitle}: ${store.name}`}
      subtitle={dict.admin.storePageSubtitle}
    >
      {menuUrl && (
        <Card>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">
              {dict.admin.publicMenuUrl}
            </p>
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-mono text-sm text-blue-700 underline"
            >
              {menuUrl}
            </a>
            <p className="text-xs text-slate-500">
              {dict.admin.qrTarget}: /{store.slug}/menu
            </p>
          </div>
        </Card>
      )}

      <Card>
        <AdminEditStoreForm
          store={{
            id: store.id,
            name: store.name ?? "",
            slug: store.slug ?? "",
            logoUrl: store.logo_url ?? "",
            bannerUrl: store.banner_url ?? "",
            primaryColor: store.primary_color ?? "#111827",
            secondaryColor: store.secondary_color ?? "#f59e0b",
            phone: store.phone ?? "",
            email: store.email ?? "",
            address: store.address ?? "",
            status: store.status ?? "active",
          }}
        />
      </Card>
    </AppShell>
  );
}
