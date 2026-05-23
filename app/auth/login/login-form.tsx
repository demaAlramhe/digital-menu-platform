"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { InternalAtmosphere } from "@/components/dashboard/ui/internal-atmosphere";
import { dash } from "@/components/dashboard/ui/styles";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const supabase = createClient();
  const { dict } = useLocale();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main className={`${dash.shell} relative flex min-h-screen flex-col`}>
      <InternalAtmosphere />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
        <div className="mb-6 rounded-xl border border-stone-200/80 bg-white/80 p-0.5 shadow-sm">
          <LanguageSwitcher compact />
        </div>

        <div className="w-full max-w-[26rem] text-center">
          <p className={dash.eyebrow}>{dict.common.brand}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {dict.auth.title}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-stone-600">
            {dict.auth.subtitle}
          </p>
        </div>

        <div className={`${dash.card} mt-8 w-full max-w-[26rem] p-6 sm:p-8`}>
          <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-5">
            <label className="block w-full text-center">
              <span className={`mb-1.5 block ${dash.label}`}>{dict.auth.email}</span>
              <input
                className={`${dash.input} text-center`}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="owner@store.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="block w-full text-center">
              <span className={`mb-1.5 block ${dash.label}`}>{dict.auth.password}</span>
              <input
                className={`${dash.input} text-center`}
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {message && (
              <p className="text-center text-sm text-red-600" role="alert">
                {message}
              </p>
            )}

            <button
              type="submit"
              className={`${dash.primaryBtn} w-full`}
              disabled={loading}
              suppressHydrationWarning
            >
              {loading ? dict.auth.signingIn : dict.auth.signIn}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
