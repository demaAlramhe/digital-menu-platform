"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const { dict } = useLocale();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      router.push("/auth/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border px-4 py-2 font-medium"
    >
      {loading ? dict.common.loading : dict.common.logout}
    </button>
  );
}
