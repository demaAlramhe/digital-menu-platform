"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { DangerButton } from "@/components/dashboard/ui/buttons";

type DeleteMenuItemButtonProps = {
  menuItemId: string;
};

export function DeleteMenuItemButton({ menuItemId }: DeleteMenuItemButtonProps) {
  const router = useRouter();
  const { dict } = useLocale();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(dict.menuItems.deleteConfirm)) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/menu-items/${menuItemId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.error || dict.menuItems.deleteError);
        return;
      }
      router.refresh();
    } catch {
      alert(dict.menuItems.deleteError);
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
