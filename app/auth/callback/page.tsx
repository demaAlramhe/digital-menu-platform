"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackLoading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-4 text-brand-dark"
      dir="rtl"
    >
      <p className="text-center text-[15px] text-[#6b7280]">
        جارٍ تفعيل حسابك...
      </p>
    </div>
  );
}

function parseHashTokens(hash: string): {
  access_token: string | null;
  refresh_token: string | null;
} {
  const normalized = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(normalized);
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
  };
}

function clearUrlHash() {
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(window.history.state, "", url.toString());
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function resolveSession() {
      const next = searchParams.get("next") ?? "/auth/set-password";
      const code = searchParams.get("code");

      // Capture hash tokens synchronously BEFORE any await so detectSessionInUrl
      // (which clears the hash during client init) cannot race us out of them.
      const hashTokens = parseHashTokens(window.location.hash);

      const supabase = createClient();
      let establishedFromUrl = false;

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          establishedFromUrl = true;
        }
      } else if (hashTokens.access_token && hashTokens.refresh_token) {
        // Explicitly overwrite any existing browser session with the invite tokens.
        // Harmless/idempotent if detectSessionInUrl already applied the same tokens.
        const { error } = await supabase.auth.setSession({
          access_token: hashTokens.access_token,
          refresh_token: hashTokens.refresh_token,
        });
        if (!error) {
          establishedFromUrl = true;
        }
        clearUrlHash();
      }

      if (cancelled) return;

      if (establishedFromUrl) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error(
            "[auth/callback] Session exchange succeeded but getUser() returned no user",
            userError
          );
          router.replace("/auth/login?error=invite_failed");
          return;
        }

        clearUrlHash();
        router.replace(next);
        return;
      }

      // Neither code nor hash tokens were available to process — last-resort check
      // for a session already established (e.g. detectSessionInUrl finished first).
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        clearUrlHash();
        router.replace(next);
        return;
      }

      router.replace("/auth/login?error=invite_failed");
    }

    void resolveSession();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return <AuthCallbackLoading />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackInner />
    </Suspense>
  );
}
