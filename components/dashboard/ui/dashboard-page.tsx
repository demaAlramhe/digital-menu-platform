import type { ReactNode } from "react";
import { dash } from "./styles";

type DashboardPageProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardPage({ children, className = "" }: DashboardPageProps) {
  return (
    <main className={`${dash.page} ${className}`.trim()}>{children}</main>
  );
}
