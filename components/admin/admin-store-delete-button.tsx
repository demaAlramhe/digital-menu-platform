"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { DangerButton } from "@/components/dashboard/ui/buttons";

type AdminStoreDeleteButtonProps = {
  storeId: string;
  storeName: string;
};

export function AdminStoreDeleteButton({
  storeId,
  storeName,
}: AdminStoreDeleteButtonProps) {
  const router = useRouter();
  const { dict } = useLocale();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      dict.admin.deleteStoreConfirm.replace("{name}", storeName)
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/stores/${storeId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        alert(result.error || dict.admin.deleteStoreFailed);
        return;
      }

      router.push("/admin/stores");
      router.refresh();
    } catch {
      alert(dict.admin.deleteStoreError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DangerButton type="button" onClick={handleDelete} disabled={loading}>
      {loading ? dict.common.deleting : dict.common.delete}
    </DangerButton>
  );
}
