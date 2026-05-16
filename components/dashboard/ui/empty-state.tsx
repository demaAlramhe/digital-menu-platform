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
      className={`${dash.card} flex flex-col items-center px-6 py-14 text-center sm:py-16`}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-600">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
