import type { ReactNode } from "react";
import { dash } from "./styles";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div
      className={`${dash.card} flex flex-col items-center px-6 py-16 text-center sm:py-20`}
    >
      {icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 text-stone-500 ring-1 ring-stone-200/60">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold tracking-tight text-stone-900">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600">
          {description}
        </p>
      )}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
