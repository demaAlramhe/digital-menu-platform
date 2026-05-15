"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteMenuItemButtonProps = {
  menuItemId: string;
};

export function DeleteMenuItemButton({ menuItemId }: DeleteMenuItemButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/menu-items/${menuItemId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to delete menu item.");
        return;
      }

      router.refresh();
    } catch {
      alert("Something went wrong while deleting the menu item.");
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
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
