import type { ReactNode } from "react";
import { dash } from "./styles";

type StatTone = "default" | "success" | "danger" | "muted" | "info" | "warning";

const toneValueClass: Record<StatTone, string> = {
  default: "text-stone-900",
  success: "text-emerald-700",
  danger: "text-red-700",
  muted: "text-stone-600",
  info: "text-sky-700",
  warning: "text-amber-800",
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  tone?: StatTone;
  hint?: string;
};

export function StatCard({ label, value, tone = "default", hint }: StatCardProps) {
  return (
    <div className={dash.statCard}>
      <p className={dash.statLabel}>{label}</p>
      <p className={`${dash.statValue} ${toneValueClass[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
