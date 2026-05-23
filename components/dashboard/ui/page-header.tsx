import type { ReactNode } from "react";
import { dash } from "./styles";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-stone-200/60 pb-6">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className={`mb-2 ${dash.eyebrow}`}>{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.75rem] lg:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 max-w-3xl text-[15px] leading-relaxed text-stone-600">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>
      )}
    </div>
  );
}
