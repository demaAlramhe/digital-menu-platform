"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";

type AdminUserRoleSelectProps = {
  userId: string;
  currentRole: string | null;
};

export function AdminUserRoleSelect({
  userId,
  currentRole,
}: AdminUserRoleSelectProps) {
  const router = useRouter();
  const { dict } = useLocale();
  const [role, setRole] = useState(currentRole ?? "store_owner");
  const [loading, setLoading] = useState(false);

  async function handleChange(nextRole: string) {
    setRole(nextRole);

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: nextRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || dict.admin.roleUpdateFailed);
        setRole(currentRole ?? "store_owner");
        return;
      }

      router.refresh();
    } catch {
      alert(dict.admin.roleUpdateError);
      setRole(currentRole ?? "store_owner");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
    >
      <option value="super_admin">{dict.roles.superAdmin}</option>
      <option value="store_owner">{dict.roles.storeOwner}</option>
    </select>
  );
}
