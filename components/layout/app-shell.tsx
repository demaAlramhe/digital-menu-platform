import type { ReactNode } from "react";
import { PageHeader } from "@/components/dashboard/ui/page-header";
import { dash } from "@/components/dashboard/ui/styles";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function AppShell({ title, subtitle, children, action }: AppShellProps) {
  return (
    <main className={dash.page}>
      <PageHeader title={title} description={subtitle} action={action} />
      <div className="space-y-6">{children}</div>
    </main>
  );
}
