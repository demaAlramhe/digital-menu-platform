"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MenuItemImageUpload } from "@/components/dashboard/menu-item-image-upload";
import { normalizeSlug } from "@/lib/utils/slug";

type CategoryOption = {
  id: string;
  name: string;
};

type EditMenuItemFormProps = {
  menuItem: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    sortOrder: number;
    categoryId: string;
    isActive: boolean;
    isFeatured: boolean;
    imageUrl: string;
  };
  categories: CategoryOption[];
};

export function EditMenuItemForm({ menuItem, categories }: EditMenuItemFormProps) {
  const router = useRouter();

  const [name, setName] = useState(menuItem.name);
  const [slug, setSlug] = useState(menuItem.slug);
  const [description, setDescription] = useState(menuItem.description);
  const [price, setPrice] = useState(String(menuItem.price));
  const [sortOrder, setSortOrder] = useState(String(menuItem.sortOrder));
  const [categoryId, setCategoryId] = useState(menuItem.categoryId);
  const [isActive, setIsActive] = useState(menuItem.isActive);
  const [isFeatured, setIsFeatured] = useState(menuItem.isFeatured);
  const [imageUrl, setImageUrl] = useState(menuItem.imageUrl);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !slug.trim() || !price.trim()) {
      setMessage("Name, slug, and price are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/menu-items/${menuItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: normalizeSlug(slug),
          description,
          price: Number(price),
          sortOrder: Number(sortOrder || 0),
          categoryId: categoryId || null,
          isActive,
          isFeatured,
          imageUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Failed to update menu item.");
        return;
      }

      router.push("/dashboard/menu-items");
      router.refresh();
    } catch {
      setMessage("Something went wrong while updating the menu item.");
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
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          rows={4}
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        >
          {categories.length === 0 ? (
            <option value="">No categories yet</option>
          ) : (
            categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))
          )}
        </select>
      </div>

      <MenuItemImageUpload value={imageUrl} onChange={setImageUrl} />

      <div>
        <label className="mb-1 block font-medium">Price</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Sort Order</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="editIsActive"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <label htmlFor="editIsActive" className="font-medium">
          Active menu item
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="editIsFeatured"
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
        />
        <label htmlFor="editIsFeatured" className="font-medium">
          Featured item
        </label>
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <Link
          href="/dashboard/menu-items"
          className="rounded-lg border px-4 py-2 font-medium"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
