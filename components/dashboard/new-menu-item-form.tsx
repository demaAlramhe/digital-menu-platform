"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { MenuItemImageUpload } from "@/components/dashboard/menu-item-image-upload";
import { PrimarySubmitButton } from "@/components/dashboard/ui/buttons";
import {
  CheckboxField,
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

type CategoryOption = {
  id: string;
  name: string;
};

type NewMenuItemFormProps = {
  categories: CategoryOption[];
};

export function NewMenuItemForm({ categories }: NewMenuItemFormProps) {
  const router = useRouter();
  const { dict } = useLocale();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
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

      const response = await fetch("/api/menu-items", {
        method: "POST",
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
        setMessage(result.error || dict.menuItems.createError);
        return;
      }

      router.push("/dashboard/menu-items?success=created");
      router.refresh();
    } catch {
      setMessage(dict.menuItems.createError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell onSubmit={handleSubmit}>
      <FormSection title={dict.menuItems.addTitle}>
        <FormField label={dict.common.name}>
          <FormInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={dict.menuItems.placeholders.name}
          />
        </FormField>

        <FormField label={dict.common.slug}>
          <FormInput
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={dict.menuItems.placeholders.slug}
          />
        </FormField>

        <FormField label={dict.common.description}>
          <FormTextarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={dict.menuItems.placeholders.description}
            rows={4}
          />
        </FormField>

        <FormField label={dict.common.category}>
          <FormSelect
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.length === 0 ? (
              <option value="">{dict.common.noCategories}</option>
            ) : (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </FormSelect>
        </FormField>
      </FormSection>

      <FormSection>
        <MenuItemImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          folder={CLOUDINARY_FOLDERS.menuItems}
        />
      </FormSection>

      <FormSection>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={dict.common.price}>
            <FormInput
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </FormField>

          <FormField label={dict.common.sortOrder}>
            <FormInput
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
            />
          </FormField>
        </div>

        <CheckboxField
          id="isActive"
          label={dict.menuItems.activeItem}
          checked={isActive}
          onChange={setIsActive}
        />

        <CheckboxField
          id="isFeatured"
          label={dict.menuItems.featuredItem}
          checked={isFeatured}
          onChange={setIsFeatured}
        />
      </FormSection>

      <FormMessage message={message} variant={message ? "error" : "muted"} />

      <PrimarySubmitButton disabled={loading}>
        {loading ? dict.common.saving : dict.menuItems.create}
      </PrimarySubmitButton>
    </FormShell>
  );
}
