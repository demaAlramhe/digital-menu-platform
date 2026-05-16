"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { PrimarySubmitButton, SecondaryLink } from "@/components/dashboard/ui/buttons";
import {
  CheckboxField,
  FormActions,
  FormField,
  FormInput,
  FormMessage,
  FormSection,
  FormShell,
} from "@/components/dashboard/ui/form";
import { normalizeSlug } from "@/lib/utils/slug";

type EditCategoryFormProps = {
  category: {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
  };
};

export function EditCategoryForm({ category }: EditCategoryFormProps) {
  const router = useRouter();
  const { dict } = useLocale();

  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder));
  const [isActive, setIsActive] = useState(category.isActive);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !slug.trim()) {
      setMessage(dict.categories.requiredFields);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/menu-categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: normalizeSlug(slug),
          sortOrder: Number(sortOrder || 0),
          isActive,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || dict.menuItems.updateError);
        return;
      }
      router.push("/dashboard/categories?success=updated");
      router.refresh();
    } catch {
      setMessage(dict.menuItems.updateError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell onSubmit={handleSubmit}>
      <FormSection title={dict.categories.editTitle}>
        <FormField label={dict.common.name}>
          <FormInput value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={dict.common.slug}>
          <FormInput value={slug} onChange={(e) => setSlug(e.target.value)} />
        </FormField>
        <FormField label={dict.common.sortOrder}>
          <FormInput type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </FormField>
        <CheckboxField
          id="editCategoryIsActive"
          label={dict.categories.activeCategory}
          checked={isActive}
          onChange={setIsActive}
        />
      </FormSection>

      <FormMessage message={message} variant={message ? "error" : "muted"} />

      <FormActions>
        <PrimarySubmitButton disabled={loading}>
          {loading ? dict.common.saving : dict.menuItems.saveChanges}
        </PrimarySubmitButton>
        <SecondaryLink href="/dashboard/categories">{dict.common.cancel}</SecondaryLink>
      </FormActions>
    </FormShell>
  );
}
