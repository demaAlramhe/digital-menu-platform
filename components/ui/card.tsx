import type { ReactNode } from "react";
import { dash } from "@/components/dashboard/ui/styles";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section className={`${dash.card} p-5 sm:p-6 ${className}`.trim()}>
      {children}
    </section>
  );
}
