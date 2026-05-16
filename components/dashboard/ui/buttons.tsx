import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { dash } from "./styles";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${dash.primaryBtn} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function PrimarySubmitButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="submit" className={`${dash.primaryBtn} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${dash.secondaryBtn} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${dash.dangerBtn} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function PrimaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${dash.primaryBtn} ${className}`.trim()}>
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${dash.secondaryBtn} ${className}`.trim()}>
      {children}
    </Link>
  );
}
