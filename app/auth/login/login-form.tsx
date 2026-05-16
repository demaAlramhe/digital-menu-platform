"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { Card } from "@/components/ui/card";
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
    <AppShell title={dict.auth.title} subtitle={dict.auth.subtitle}>
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher compact />
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="grid max-w-md gap-4">
          <label className="grid gap-1 text-sm">
            <span>{dict.auth.email}</span>
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="owner@store.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span>{dict.auth.password}</span>
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {message && <p className="text-sm text-red-600">{message}</p>}

          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={loading}
            suppressHydrationWarning
          >
            {loading ? dict.auth.signingIn : dict.auth.signIn}
          </button>
        </form>
      </Card>
    </AppShell>
  );
}
