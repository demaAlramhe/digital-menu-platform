"use client";

import {
  CheckboxField,
  FormField,
  FormInput,
  FormSection,
} from "@/components/dashboard/ui/form";
import { SecondaryButton, DangerButton } from "@/components/dashboard/ui/buttons";
import { useLocale } from "@/components/i18n/locale-provider";

export const MAX_MENU_ITEM_VARIANTS = 6;

export type VariantDraft = {
  key: string;
  id?: string;
  name: string;
  price: string;
};

export function newVariantDraft(): VariantDraft {
  return {
    key:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `variant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: "",
    price: "",
  };
}

export function collectValidVariants(rows: VariantDraft[]) {
  return rows
    .map((row, index) => ({
      id: row.id,
      name: row.name.trim(),
      price: Number(row.price),
      sortOrder: index,
    }))
    .filter(
      (row) =>
        row.name.length > 0 &&
        Number.isFinite(row.price) &&
        row.price >= 0
    );
}

type MenuItemVariantsFieldsProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  rows: VariantDraft[];
  onRowsChange: (rows: VariantDraft[]) => void;
};

export function MenuItemVariantsFields({
  enabled,
  onEnabledChange,
  rows,
  onRowsChange,
}: MenuItemVariantsFieldsProps) {
  const { dict } = useLocale();

  function handleEnabledChange(next: boolean) {
    onEnabledChange(next);
    if (next && rows.length === 0) {
      onRowsChange([newVariantDraft()]);
    }
  }

  function updateRow(key: string, patch: Partial<VariantDraft>) {
    onRowsChange(
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function removeRow(key: string) {
    onRowsChange(rows.filter((row) => row.key !== key));
  }

  function addRow() {
    if (rows.length >= MAX_MENU_ITEM_VARIANTS) return;
    onRowsChange([...rows, newVariantDraft()]);
  }

  return (
    <FormSection title={dict.menuItems.variantsSection}>
      <CheckboxField
        id="hasVariants"
        label={dict.menuItems.variantsToggle}
        checked={enabled}
        onChange={handleEnabledChange}
      />

      {enabled && (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={row.key}
              className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
            >
              <FormField label={dict.menuItems.variantName}>
                <FormInput
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(row.key, { name: e.target.value })}
                  placeholder={dict.menuItems.variantNamePlaceholder}
                  aria-label={`${dict.menuItems.variantName} ${index + 1}`}
                />
              </FormField>
              <FormField label={dict.menuItems.variantPrice}>
                <FormInput
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.price}
                  onChange={(e) => updateRow(row.key, { price: e.target.value })}
                  placeholder="0.00"
                  aria-label={`${dict.menuItems.variantPrice} ${index + 1}`}
                />
              </FormField>
              <DangerButton
                type="button"
                className="min-h-11 px-3"
                onClick={() => removeRow(row.key)}
              >
                {dict.common.delete}
              </DangerButton>
            </div>
          ))}

          <SecondaryButton
            type="button"
            disabled={rows.length >= MAX_MENU_ITEM_VARIANTS}
            onClick={addRow}
          >
            {dict.menuItems.addVariant}
          </SecondaryButton>
        </div>
      )}
    </FormSection>
  );
}
