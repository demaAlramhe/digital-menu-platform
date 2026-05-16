import type { ReactNode } from "react";

type AlertBannerProps = {
  children: ReactNode;
  variant?: "warning" | "error" | "info";
};

export function AlertBanner({ children, variant = "warning" }: AlertBannerProps) {
  const styles = {
    warning: "border-amber-200/90 bg-amber-50 text-amber-950",
    error: "border-red-200/90 bg-red-50 text-red-900",
    info: "border-sky-200/90 bg-sky-50 text-sky-900",
  }[variant];

  return (
    <p
      className={`mb-6 rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles}`}
      role="status"
    >
      {children}
    </p>
  );
}
