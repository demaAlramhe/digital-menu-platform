"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";

type AdminStoreStatusButtonProps = {
  storeId: string;
  currentStatus: string | null;
};

export function AdminStoreStatusButton({
  storeId,
  currentStatus,
}: AdminStoreStatusButtonProps) {
  const router = useRouter();
  const { dict } = useLocale();
  const [loading, setLoading] = useState(false);

  const nextStatus =
    currentStatus === "active"
      ? "inactive"
      : currentStatus === "inactive"
        ? "active"
        : "active";

  async function handleToggle() {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/stores/${storeId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || dict.admin.statusUpdateFailed);
        return;
      }

      router.refresh();
    } catch {
      alert(dict.admin.statusUpdateError);
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive() {
    const confirmed = window.confirm(dict.admin.archiveConfirm);

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/stores/${storeId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "archived",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || dict.admin.archiveFailed);
        return;
      }

      router.refresh();
    } catch {
      alert(dict.admin.archiveError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || currentStatus === "archived"}
        className="rounded-lg border px-4 py-2 font-medium disabled:opacity-50"
      >
        {loading
          ? dict.admin.updating
          : currentStatus === "active"
            ? dict.admin.setInactive
            : currentStatus === "inactive"
              ? dict.admin.setActive
              : dict.admin.archived}
      </button>

      {currentStatus !== "archived" && (
        <button
          type="button"
          onClick={handleArchive}
          disabled={loading}
          className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 disabled:opacity-50"
        >
          {dict.admin.archive}
        </button>
      )}
    </div>
  );
}
