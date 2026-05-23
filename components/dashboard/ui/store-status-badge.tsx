type StoreStatusBadgeProps = {
  status: string | null;
  activeLabel: string;
  inactiveLabel: string;
  archivedLabel: string;
};

export function StoreStatusBadge({
  status,
  activeLabel,
  inactiveLabel,
  archivedLabel,
}: StoreStatusBadgeProps) {
  const label =
    status === "active"
      ? activeLabel
      : status === "inactive"
        ? inactiveLabel
        : status === "archived"
          ? archivedLabel
          : (status ?? "—");

  const toneClass =
    status === "active"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200/80"
      : status === "inactive"
        ? "bg-red-50 text-red-800 ring-red-200/80"
        : "bg-stone-100 text-stone-600 ring-stone-200/80";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${toneClass}`}
    >
      {label}
    </span>
  );
}
