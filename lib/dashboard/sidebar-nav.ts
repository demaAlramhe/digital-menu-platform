import type { Dictionary } from "@/lib/i18n/types";

export type SidebarNavItem = {
  id: string;
  /** Dictionary path, e.g. "nav.menuItems" */
  labelKey: string;
  href: string;
  icon: string;
  exact?: boolean;
  /** Key for optional badge counts passed to the sidebar (e.g. "signups"). */
  badgeId?: string;
};

export type SidebarNavGroup = {
  id: string;
  labelKey?: string;
  items: SidebarNavItem[];
};

export const ownerSidebarNav: SidebarNavGroup[] = [
  {
    id: "main",
    items: [
      {
        id: "home",
        labelKey: "nav.dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        exact: true,
      },
      {
        id: "menu-items",
        labelKey: "nav.menuItems",
        href: "/dashboard/menu-items",
        icon: "UtensilsCrossed",
      },
      {
        id: "categories",
        labelKey: "nav.categories",
        href: "/dashboard/categories",
        icon: "FolderTree",
      },
      {
        id: "qr",
        labelKey: "nav.qr",
        href: "/dashboard/qr",
        icon: "QrCode",
      },
      {
        id: "settings",
        labelKey: "nav.settings",
        href: "/dashboard/settings",
        icon: "Settings",
      },
    ],
  },
];

export const adminSidebarNav: SidebarNavGroup[] = [
  {
    id: "main",
    items: [
      {
        id: "overview",
        labelKey: "nav.adminHome",
        href: "/admin",
        icon: "LayoutDashboard",
        exact: true,
      },
      {
        id: "stores",
        labelKey: "nav.stores",
        href: "/admin/stores",
        icon: "Store",
      },
      {
        id: "users",
        labelKey: "nav.users",
        href: "/admin/users",
        icon: "Users",
      },
      {
        id: "signups",
        labelKey: "nav.signups",
        href: "/admin/signups",
        icon: "Inbox",
        badgeId: "signups",
      },
    ],
  },
];

export function resolveNavLabel(dict: Dictionary, labelKey: string): string {
  const [section, key] = labelKey.split(".");
  if (section === "nav" && key && key in dict.nav) {
    return dict.nav[key as keyof typeof dict.nav];
  }
  return labelKey;
}
