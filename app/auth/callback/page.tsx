"use client";

import { Suspense, useEffect, useState } from "react";
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

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: (() => void) | undefined;

    async function resolveSession() {
      const next = searchParams.get("next") ?? "/auth/set-password";
      const code = searchParams.get("code");
      const supabase = createClient();

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && !cancelled) {
          // Fall through to hash/session detection — invite links may still
          // deliver tokens via the URL fragment even when code exchange fails.
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        router.replace(next);
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, nextSession) => {
        if (cancelled) return;
        if (event === "SIGNED_IN" && nextSession) {
          if (timeoutId) clearTimeout(timeoutId);
          subscription.unsubscribe();
          router.replace(next);
        }
      });
      unsubscribe = () => subscription.unsubscribe();

      timeoutId = setTimeout(() => {
        if (cancelled) return;
        subscription.unsubscribe();
        setFailed(true);
        router.replace("/auth/login?error=invite_failed");
      }, 4000);
    }

    void resolveSession();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe?.();
    };
  }, [router, searchParams]);

  if (failed) {
    return <AuthCallbackLoading />;
  }

  return <AuthCallbackLoading />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackInner />
    </Suspense>
  );
}
