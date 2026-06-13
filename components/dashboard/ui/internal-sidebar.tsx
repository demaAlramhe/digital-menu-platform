"use client";

import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { tokens } from "@/components/dashboard/ui/design-tokens";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  resolveNavLabel,
  type SidebarNavGroup,
} from "@/lib/dashboard/sidebar-nav";

type InternalSidebarProps = {
  navGroups: SidebarNavGroup[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  brandLabel: string;
  badges?: Record<string, number>;
};

function SidebarIcon({ name, className }: { name: string; className?: string }) {
  const icons = LucideIcons as unknown as Record<
    string,
    LucideIcons.LucideIcon | undefined
  >;
  const Icon = icons[name];

  if (!Icon) {
    return <LucideIcons.Circle className={className} aria-hidden />;
  }

  return <Icon className={className} aria-hidden />;
}

export function InternalSidebar({
  navGroups,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileClose,
  brandLabel,
  badges = {},
}: InternalSidebarProps) {
  const pathname = usePathname();
  const { dict, dir } = useLocale();

  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const mobileHidden =
    dir === "rtl" ? "translate-x-full" : "-translate-x-full";

  const CollapseIcon =
    dir === "rtl"
      ? collapsed
        ? LucideIcons.ChevronLeft
        : LucideIcons.ChevronRight
      : collapsed
        ? LucideIcons.ChevronRight
        : LucideIcons.ChevronLeft;

  const collapseLabel = collapsed
    ? dict.nav.sidebarExpand
    : dict.nav.sidebarCollapse;

  const sidebarContent = (
    <>
      <div className="shrink-0 border-b border-stone-200">
        <div
          className={`flex h-14 items-center gap-2 px-3 ${
            collapsed ? "md:justify-center md:px-2" : ""
          }`}
        >
          <Link
            href={navGroups[0]?.items[0]?.href ?? "/"}
            className={`flex min-w-0 flex-1 items-center gap-2 ${
              collapsed ? "md:flex-none md:justify-center" : ""
            }`}
            onClick={onMobileClose}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white">
              <LucideIcons.LayoutGrid className="h-4 w-4" aria-hidden />
            </span>
            <span
              className={`truncate text-sm font-semibold text-stone-900 ${
                collapsed ? "md:hidden" : ""
              }`}
            >
              {brandLabel}
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={onToggleCollapsed}
          title={collapseLabel}
          aria-label={collapseLabel}
          aria-expanded={!collapsed}
          className="mx-auto mb-2 mt-2 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-100 md:flex"
        >
          <CollapseIcon className="h-5 w-5 shrink-0" aria-hidden />
        </button>
      </div>

      <nav
        className="flex-1 overflow-x-hidden overflow-y-auto p-3 md:px-2"
        aria-label={dict.nav.site}
      >
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {group.labelKey && (
              <p
                className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400 ${
                  collapsed ? "md:hidden" : ""
                }`}
              >
                {resolveNavLabel(dict, group.labelKey)}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                const label = resolveNavLabel(dict, item.labelKey);
                const badgeCount = item.badgeId
                  ? badges[item.badgeId] ?? 0
                  : 0;

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      title={collapsed ? label : undefined}
                      aria-current={active ? "page" : undefined}
                      onClick={onMobileClose}
                      className={`relative ${tokens.sidebar.item} ${
                        collapsed ? "md:justify-center md:gap-0 md:px-0" : ""
                      } ${
                        active
                          ? tokens.sidebar.itemActive
                          : tokens.sidebar.itemInactive
                      }`}
                    >
                      <SidebarIcon
                        name={item.icon}
                        className="h-[18px] w-[18px] shrink-0"
                      />
                      <span
                        className={`min-w-0 flex-1 truncate ${
                          collapsed ? "md:hidden" : ""
                        }`}
                      >
                        {label}
                      </span>
                      {badgeCount > 0 && (
                        <span
                          className={`inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white ${
                            collapsed ? "md:hidden" : ""
                          }`}
                        >
                          {badgeCount}
                        </span>
                      )}
                      {badgeCount > 0 && (
                        <span
                          className={`absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 ${
                            collapsed ? "hidden md:block" : "hidden"
                          }`}
                          aria-hidden
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-label={dict.common.dismiss}
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`group/sidebar fixed inset-y-0 start-0 z-50 flex w-64 flex-col overflow-hidden transition-all duration-200 print:hidden md:z-20 ${
          tokens.sidebar.background
        } ${collapsed ? "md:w-[68px]" : "md:w-64"} ${
          mobileOpen ? "translate-x-0" : mobileHidden
        } md:translate-x-0`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
