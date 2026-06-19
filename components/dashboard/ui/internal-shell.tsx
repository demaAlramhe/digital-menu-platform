"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { tokens } from "@/components/dashboard/ui/design-tokens";
import { InternalSidebar } from "@/components/dashboard/ui/internal-sidebar";
import type { SidebarNavGroup } from "@/lib/dashboard/sidebar-nav";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

type InternalShellProps = {
  navGroups: SidebarNavGroup[];
  children: ReactNode;
  brandLabel: string;
  pageTitle?: string;
  topbarActions?: ReactNode;
  badges?: Record<string, number>;
};

export function InternalShell({
  navGroups,
  children,
  brandLabel,
  pageTitle,
  topbarActions,
  badges,
}: InternalShellProps) {
  const { dict } = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed, ready]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const languageSwitcher = (
    <div className="rounded-xl border border-brand-secondary/40 bg-white p-0.5 shadow-sm">
      <LanguageSwitcher compact />
    </div>
  );

  const logoutControl = (
    <div className="shrink-0 [&_button]:h-10 [&_button]:min-h-10 [&_button]:px-3 [&_button]:py-2 sm:[&_button]:min-h-11 sm:[&_button]:px-5 sm:[&_button]:py-2.5">
      <LogoutButton />
    </div>
  );

  const defaultTopbarActions = (
    <>
      <div className="shrink-0">{languageSwitcher}</div>
      {logoutControl}
    </>
  );

  const resolvedTopbarActions = topbarActions ?? defaultTopbarActions;

  return (
    <div className={`min-h-screen ${tokens.page.background}`}>
      <InternalSidebar
        navGroups={navGroups}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        brandLabel={brandLabel}
        badges={badges}
      />

      <div
        className={`flex min-h-screen w-full min-w-0 flex-col transition-[padding] duration-200 ${
          collapsed ? "md:ps-[68px]" : "md:ps-64"
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-brand-secondary/40 bg-white/80 backdrop-blur-sm print:hidden">
          <div className="relative flex min-h-11 items-center justify-center px-4 py-2.5 sm:min-h-12 sm:px-6 sm:py-3">
            <button
              type="button"
              className="absolute start-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-brand-secondary/40 bg-white px-3 py-2 text-brand-dark shadow-sm transition hover:bg-brand-secondary/10 sm:start-6 md:hidden"
              aria-expanded={mobileOpen}
              aria-label={dict.nav.site}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>

            {pageTitle && (
              <h1 className="sr-only">{pageTitle}</h1>
            )}

            <div className="flex items-center justify-center gap-2">
              {resolvedTopbarActions}
            </div>
          </div>
        </header>

        <main className="w-full min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className={`mx-auto w-full min-w-0 ${tokens.page.maxWidth}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
