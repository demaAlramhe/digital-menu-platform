"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { MenuItemImageUpload } from "@/components/dashboard/menu-item-image-upload";
import { PrimarySubmitButton, SecondaryLink } from "@/components/dashboard/ui/buttons";
import {
  CheckboxField,
  FormActions,
  FormField,
  FormInput,
  FormMessage,
  FormSection,
  FormSelect,
  FormShell,
  FormTextarea,
} from "@/components/dashboard/ui/form";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary/folders";
import { normalizeSlug } from "@/lib/utils/slug";

type CategoryOption = { id: string; name: string };

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
  const { dict } = useLocale();

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
      setMessage(dict.menuItems.requiredFields);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/menu-items/${menuItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
        setMessage(result.error || dict.menuItems.updateError);
        return;
      }
      router.push("/dashboard/menu-items?success=updated");
      router.refresh();
    } catch {
      setMessage(dict.menuItems.updateError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell onSubmit={handleSubmit}>
      <FormSection title={dict.menuItems.editTitle}>
        <FormField label={dict.common.name}>
          <FormInput value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={dict.common.slug}>
          <FormInput value={slug} onChange={(e) => setSlug(e.target.value)} />
        </FormField>
        <FormField label={dict.common.description}>
          <FormTextarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </FormField>
        <FormField label={dict.common.category}>
          <FormSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.length === 0 ? (
              <option value="">{dict.common.noCategories}</option>
            ) : (
              categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            )}
          </FormSelect>
        </FormField>
      </FormSection>

      <FormSection>
        <MenuItemImageUpload value={imageUrl} onChange={setImageUrl} folder={CLOUDINARY_FOLDERS.menuItems} />
      </FormSection>

      <FormSection>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={dict.common.price}>
            <FormInput type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </FormField>
          <FormField label={dict.common.sortOrder}>
            <FormInput type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </FormField>
        </div>
        <CheckboxField id="editIsActive" label={dict.menuItems.activeItem} checked={isActive} onChange={setIsActive} />
        <CheckboxField id="editIsFeatured" label={dict.menuItems.featuredItem} checked={isFeatured} onChange={setIsFeatured} />
      </FormSection>

      <FormMessage message={message} variant={message ? "error" : "muted"} />

      <FormActions>
        <PrimarySubmitButton disabled={loading}>
          {loading ? dict.common.saving : dict.menuItems.saveChanges}
        </PrimarySubmitButton>
        <SecondaryLink href="/dashboard/menu-items">{dict.common.cancel}</SecondaryLink>
      </FormActions>
    </FormShell>
  );
}
