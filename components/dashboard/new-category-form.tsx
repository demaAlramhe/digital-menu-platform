"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { PrimarySubmitButton } from "@/components/dashboard/ui/buttons";
import {
  CheckboxField,
  FormField,
  FormInput,
  FormMessage,
  FormSection,
  FormShell,
} from "@/components/dashboard/ui/form";
import { normalizeSlug } from "@/lib/utils/slug";

export function NewCategoryForm() {
  const router = useRouter();
  const { dict } = useLocale();

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
      setMessage(dict.categories.requiredFields);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/menu-categories", {
        method: "POST",
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
        setMessage(result.error || dict.menuItems.createError);
        return;
      }
      router.push("/dashboard/categories?success=created");
      router.refresh();
    } catch {
      setMessage(dict.menuItems.createError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell onSubmit={handleSubmit}>
      <FormSection title={dict.categories.addTitle}>
        <FormField label={dict.common.name}>
          <FormInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={dict.categories.placeholders.name}
          />
        </FormField>
        <FormField label={dict.common.slug}>
          <FormInput
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={dict.categories.placeholders.slug}
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
        <CheckboxField
          id="categoryIsActive"
          label={dict.categories.activeCategory}
          checked={isActive}
          onChange={setIsActive}
        />
      </FormSection>

      <FormMessage message={message} variant={message ? "error" : "muted"} />

      <PrimarySubmitButton disabled={loading}>
        {loading ? dict.common.saving : dict.categories.create}
      </PrimarySubmitButton>
    </FormShell>
  );
}
