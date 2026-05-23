import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { dash } from "@/components/dashboard/ui/styles";
import { PublicLinkActions } from "@/components/dashboard/public-link-actions";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getOwnerPublicUrls } from "@/lib/data/owner-public-urls";
import { loadOwnerStoreBasic, requireOwnerStoreId } from "@/lib/data/owner-store";
import { getTranslations } from "@/lib/i18n/server";

const QUICK_LINKS = [
  {
    href: "/dashboard/menu-items",
    titleKey: "cardMenuItems" as const,
    descKey: "cardMenuItemsDesc" as const,
    icon: MenuIcon,
    accent: "bg-sky-50 text-sky-700",
  },
  {
    href: "/dashboard/categories",
    titleKey: "cardCategories" as const,
    descKey: "cardCategoriesDesc" as const,
    icon: CategoryIcon,
    accent: "bg-violet-50 text-violet-700",
  },
  {
    href: "/dashboard/menu-items/new",
    titleKey: "cardAddItem" as const,
    descKey: "cardAddItemDesc" as const,
    icon: PlusIcon,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/dashboard/settings",
    titleKey: "cardSettings" as const,
    descKey: "cardSettingsDesc" as const,
    icon: SettingsIcon,
    accent: "bg-amber-50 text-amber-800",
  },
  {
    href: "/dashboard/qr",
    titleKey: "cardQr" as const,
    descKey: "cardQrDesc" as const,
    icon: QrIcon,
    accent: "bg-stone-100 text-stone-800",
  },
] as const;

export default async function DashboardHomePage() {
  const current = await getCurrentProfile();
  const { dict } = await getTranslations();

  if (!current) {
    redirect("/auth/login");
  }

  const storeId = await requireOwnerStoreId();
  const { store } = await loadOwnerStoreBasic(storeId);

  const publicUrls = store?.slug
    ? await getOwnerPublicUrls(store.slug)
    : null;

  const displayName = current.profile?.full_name || current.user.email;

  return (
    <DashboardPage>
      <section className={`${dash.hero}`}>
        <div
          className="pointer-events-none absolute -end-12 -top-12 h-48 w-48 rounded-full bg-amber-100/30 blur-2xl"
          aria-hidden
        />
        <p className={dash.eyebrow}>{dict.nav.dashboard}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {dict.dashboard.welcome}, {displayName}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-600">
          {dict.dashboard.intro}
        </p>
      </section>

      {publicUrls && (
        <div className="mt-6">
          <PublicLinkActions
            entryUrl={publicUrls.entryUrl}
            menuUrl={publicUrls.menuUrl}
          />
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${dash.cardHover} group flex flex-col p-5 sm:p-6`}
            >
              <span
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.accent}`}
              >
                <Icon />
              </span>
              <h2 className="text-lg font-semibold text-stone-900 group-hover:text-stone-950">
                {dict.dashboard[item.titleKey]}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                {dict.dashboard[item.descKey]}
              </p>
              <span
                className="mt-4 inline-block text-sm font-medium text-stone-400 transition group-hover:text-stone-800 rtl:rotate-180"
                aria-hidden
              >
                →
              </span>
            </Link>
          );
        })}
      </div>
    </DashboardPage>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h7v7H4V7Zm9 0h7v4h-7V7Zm0 6h7v5h-7v-5ZM4 16h7v3H4v-3Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm14 0h2v2h-2v-2Zm-4 0h2v6h-2v-6Zm4 4h2v2h-2v-2Z" />
    </svg>
  );
}
