"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteCategoryButtonProps = {
  categoryId: string;
};

export function DeleteCategoryButton({ categoryId }: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/menu-categories/${categoryId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to delete category.");
        return;
      }

      router.refresh();
    } catch {
      alert("Something went wrong while deleting the category.");
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
