"use client";

import { useState } from "react";
import {
  marketingCardClass,
  marketingErrorClass,
  marketingInputClass,
  marketingLabelClass,
  marketingPrimaryBtnClass,
} from "@/components/marketing/marketing-form-styles";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { createClient } from "@/lib/supabase/client";

export function SetPasswordForm() {
  const supabase = createClient();
  const { dict } = useLocale();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!password.trim() || !confirmPassword.trim()) {
      setMessage(dict.auth.setPasswordRequired);
      return;
    }

    if (password !== confirmPassword) {
      setMessage(dict.auth.setPasswordMismatch);
      return;
    }

    if (password.length < 6) {
      setMessage(dict.auth.setPasswordTooShort);
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage(error.message || dict.auth.setPasswordError);
        return;
      }

      window.location.assign("/auth/redirect");
    } catch {
      setMessage(dict.auth.setPasswordError);
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
        <h1 className="text-2xl font-semibold tracking-tight text-brand-dark sm:text-3xl">
          {dict.auth.setPasswordTitle}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[#6b7280]">
          {dict.auth.setPasswordSubtitle}
        </p>
      </div>

      <div className={`${marketingCardClass} mt-8 w-full max-w-[26rem]`}>
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-sm flex-col gap-5"
        >
          <label className="block w-full text-center">
            <span className={`mb-1.5 block ${marketingLabelClass}`}>
              {dict.auth.setPasswordPassword}
            </span>
            <input
              className={`${marketingInputClass} text-center`}
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="mt-1.5 block text-xs text-[#6b7280]">
              {dict.auth.setPasswordHint}
            </span>
          </label>

          <label className="block w-full text-center">
            <span className={`mb-1.5 block ${marketingLabelClass}`}>
              {dict.auth.setPasswordConfirm}
            </span>
            <input
              className={`${marketingInputClass} text-center`}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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
            {loading
              ? dict.auth.setPasswordSaving
              : dict.auth.setPasswordSubmit}
          </button>
        </form>
      </div>
    </div>
  );
}
