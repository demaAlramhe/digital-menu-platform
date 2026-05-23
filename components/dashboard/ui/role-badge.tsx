import { getRoleLabel } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

export function RoleBadge({
  role,
  dict,
}: {
  role: string | null;
  dict: Dictionary;
}) {
  const toneClass =
    role === "super_admin"
      ? "bg-sky-50 text-sky-800 ring-sky-200/80"
      : role === "store_owner"
        ? "bg-emerald-50 text-emerald-800 ring-emerald-200/80"
        : "bg-stone-100 text-stone-600 ring-stone-200/80";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${toneClass}`}
    >
      {getRoleLabel(role, dict)}
    </span>
  );
}
