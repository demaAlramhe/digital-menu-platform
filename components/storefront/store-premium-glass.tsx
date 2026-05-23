import type { ReactNode } from "react";
import { premiumGlassPanelStyle } from "@/lib/storefront/premium-theme";

type StorePremiumGlassProps = {
  children: ReactNode;
  className?: string;
  /** default: centered card; wide: menu categories grid */
  size?: "card" | "wide";
};

export function StorePremiumGlass({
  children,
  className = "",
  size = "card",
}: StorePremiumGlassProps) {
  const sizeClass =
    size === "wide"
      ? "w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl"
      : "w-full max-w-[22rem] sm:max-w-[24rem]";

  return (
    <div
      className={`rounded-[1.625rem] px-6 py-8 sm:px-8 sm:py-10 ${sizeClass} ${className}`}
      style={premiumGlassPanelStyle}
    >
      {children}
    </div>
  );
}
