import { MenuItemCsvImport } from "@/components/dashboard/menu-item-csv-import";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { PageHeader } from "@/components/dashboard/ui/page-header";
import { SecondaryLink } from "@/components/dashboard/ui/buttons";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function MenuItemsImportPage() {
  const { dict } = await getTranslations();

  return (
    <DashboardPage>
      <PageHeader
        title={dict.csvImport.title}
        action={
          <SecondaryLink href="/dashboard/menu-items">
            {dict.menuItems.backToList}
          </SecondaryLink>
        }
      />
      <MenuItemCsvImport />
    </DashboardPage>
  );
}
