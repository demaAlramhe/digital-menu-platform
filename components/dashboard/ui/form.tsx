import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { dash } from "./styles";

const formShellWidthClass: Record<"default" | "wide" | "full", string> = {
  default: "w-full max-w-2xl sm:max-w-3xl",
  wide: "w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl",
  full: "w-full max-w-none",
};

export function FormShell({
  children,
  onSubmit,
  width = "default",
}: {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  width?: keyof typeof formShellWidthClass;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={`${dash.card} p-5 sm:p-6 lg:p-8 ${formShellWidthClass[width]}`}
    >
      <div className="space-y-9">{children}</div>
    </form>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      {(title || description) && (
        <div className="border-b border-stone-100 pb-4">
          {title && <h2 className={dash.sectionTitle}>{title}</h2>}
          {description && <p className={dash.sectionDesc}>{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={dash.label}>{label}</label>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-stone-500">{hint}</p>}
    </div>
  );
}

export function FormInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${dash.input} ${className}`.trim()} {...props} />;
}

export function FormSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={dash.select} {...props} />;
}

export function FormTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${dash.input} min-h-[5.5rem] resize-y`} {...props} />;
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200/80 bg-gradient-to-b from-stone-50/80 to-white px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition hover:border-stone-300 hover:shadow-sm"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900/15"
      />
      <span className="text-sm font-medium leading-snug text-stone-800">{label}</span>
    </label>
  );
}

export function FormMessage({
  message,
  variant = "muted",
}: {
  message: string;
  variant?: "muted" | "error" | "success";
}) {
  if (!message) return null;

  const styles = {
    muted: "text-stone-600",
    error: "text-red-700",
    success: "text-emerald-700",
  }[variant];

  return <p className={`text-sm ${styles}`}>{message}</p>;
}

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-stone-100 pt-6">
      {children}
    </div>
  );
}
