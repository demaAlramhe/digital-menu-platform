"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";

type DeleteCategoryButtonProps = {
  categoryId: string;
};

export function DeleteCategoryButton({ categoryId }: DeleteCategoryButtonProps) {
  const router = useRouter();
  const { dict } = useLocale();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(dict.categories.deleteConfirm);

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/menu-categories/${categoryId}`, {
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
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 disabled:opacity-50"
    >
      {loading ? dict.common.deleting : dict.common.delete}
    </button>
  );
}
