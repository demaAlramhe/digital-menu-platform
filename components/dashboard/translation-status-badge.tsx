import type { TranslationStatus } from "@/lib/dashboard/translation-status";

type TranslationStatusBadgeProps = {
  status: TranslationStatus;
  showDetails?: boolean;
};

const levelStyles = {
  full: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  partial: "bg-amber-50 text-amber-900 ring-amber-200/80",
  minimal: "bg-red-50 text-red-800 ring-red-200/80",
} as const;

const levelLabels = {
  full: "✓ Translated",
  partial: "~ Partial",
  minimal: "! Needs Translation",
} as const;

function LocalePill({ code, filled }: { code: string; filled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
        filled
          ? "bg-emerald-50 text-emerald-800 ring-emerald-200/80"
          : "bg-red-50 text-red-800 ring-red-200/80"
      }`}
    >
      <span aria-hidden>{filled ? "🟢" : "🔴"}</span>
      {code}
    </span>
  );
}

export function TranslationStatusBadge({
  status,
  showDetails = false,
}: TranslationStatusBadgeProps) {
  return (
    <div className={showDetails ? "space-y-2" : undefined}>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${levelStyles[status.level]}`}
      >
        {levelLabels[status.level]}
      </span>
      {showDetails && (
        <div className="flex flex-wrap gap-2">
          <LocalePill code="AR" filled={status.locales.ar} />
          <LocalePill code="HE" filled={status.locales.he} />
          <LocalePill code="EN" filled={status.locales.en} />
        </div>
      )}
    </div>
  );
}
