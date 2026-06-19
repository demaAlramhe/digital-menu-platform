"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BelAfiaLogo } from "@/components/marketing/bel-afia-logo";
import {
  marketingCardClass,
  marketingErrorClass,
  marketingInputClass,
  marketingLabelClass,
  marketingLinkFocus,
  marketingPrimaryBtnClass,
} from "@/components/marketing/marketing-form-styles";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const supabase = createClient();
  const { dict } = useLocale();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "no_profile") {
      setMessage(dict.auth.noProfileError);
    } else if (error === "no_store") {
      setMessage(dict.common.noStore);
    } else if (error === "unsupported_role") {
      setMessage(dict.auth.unsupportedRoleError);
    }
  }, [
    searchParams,
    dict.auth.noProfileError,
    dict.auth.unsupportedRoleError,
    dict.common.noStore,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage(dict.auth.requiredFields);
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      window.location.assign("/auth/redirect");
    } catch {
      setMessage(dict.auth.signInError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
      <div className="mb-6 rounded-xl border border-brand-secondary/40 bg-white p-0.5 shadow-sm">
        <LanguageSwitcher compact />
      </div>

      <div className="w-full max-w-[26rem] text-center">
        <div className="flex justify-center">
          <BelAfiaLogo className="!h-12 !scale-100 sm:!h-14" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-brand-dark sm:text-3xl">
          {dict.auth.title}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[#6b7280]">
          {dict.auth.subtitle}
        </p>
      </div>

      <div className={`${marketingCardClass} mt-8 w-full max-w-[26rem]`}>
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-5">
          <label className="block w-full text-center">
            <span className={`mb-1.5 block ${marketingLabelClass}`}>{dict.auth.email}</span>
            <input
              className={`${marketingInputClass} text-center`}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="owner@store.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block w-full text-center">
            <span className={`mb-1.5 block ${marketingLabelClass}`}>{dict.auth.password}</span>
            <div className="relative">
              <input
                className={`${marketingInputClass} pe-11 text-center`}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={`absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#6b7280] transition hover:bg-brand-bg hover:text-brand-dark ${marketingLinkFocus}`}
                aria-label={
                  showPassword ? dict.auth.hidePassword : dict.auth.showPassword
                }
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </label>

          {message && (
            <p className={`text-center ${marketingErrorClass}`} role="alert">
              {message}
            </p>
          )}

          <button
            type="submit"
            className={marketingPrimaryBtnClass}
            disabled={loading}
            suppressHydrationWarning
          >
            {loading ? dict.auth.signingIn : dict.auth.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}
