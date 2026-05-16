type StatusBadgeProps = {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
};

export function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
          : "bg-stone-100 text-stone-600 ring-1 ring-stone-200/80"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
