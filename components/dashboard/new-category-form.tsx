"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeSlug } from "@/lib/utils/slug";

export function NewCategoryForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !slug.trim()) {
      setMessage("Name and slug are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/menu-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: normalizeSlug(slug),
          sortOrder: Number(sortOrder || 0),
          isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Failed to create category.");
        return;
      }

      router.push("/dashboard/categories");
      router.refresh();
    } catch {
      setMessage("Something went wrong while creating the category.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Category name"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="category-slug"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Sort Order</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="0"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="categoryIsActive"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <label htmlFor="categoryIsActive" className="font-medium">
          Active category
        </label>
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : "Create Category"}
      </button>
    </form>
  );
}
