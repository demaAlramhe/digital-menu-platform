"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { DangerButton } from "@/components/dashboard/ui/buttons";

type AdminUserDeleteButtonProps = {
  userId: string;
  userLabel: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function AdminUserDeleteButton({
  userId,
  userLabel,
  disabled = false,
  disabledReason,
}: AdminUserDeleteButtonProps) {
  const router = useRouter();
  const { dict } = useLocale();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (disabled) return;

    const confirmed = window.confirm(
      dict.admin.deleteUserConfirm.replace("{name}", userLabel)
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        alert(result.error || dict.admin.deleteUserFailed);
        return;
      }

      router.refresh();
    } catch {
      alert(dict.admin.deleteUserError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <DangerButton
        type="button"
        onClick={handleDelete}
        disabled={disabled || loading}
        title={disabled ? disabledReason : undefined}
      >
        {loading ? dict.common.deleting : dict.common.delete}
      </DangerButton>
      {disabled && disabledReason && (
        <p className="max-w-[14rem] text-end text-xs text-stone-500">
          {disabledReason}
        </p>
      )}
    </div>
  );
}
