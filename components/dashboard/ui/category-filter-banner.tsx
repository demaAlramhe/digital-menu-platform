import Link from "next/link";
import { dash } from "./styles";

type CategoryFilterBannerProps = {
  label: string;
  clearLabel: string;
};

export function CategoryFilterBanner({
  label,
  clearLabel,
}: CategoryFilterBannerProps) {
  return (
    <div
      className={`${dash.card} mb-6 flex flex-wrap items-center justify-between gap-3 border-sky-200/60 bg-sky-50/80 px-4 py-3.5`}
      role="status"
    >
      <p className="text-sm font-medium text-sky-950">{label}</p>
      <Link href="/dashboard/menu-items" className={dash.secondaryBtn}>
        {clearLabel}
      </Link>
    </div>
  );
}
