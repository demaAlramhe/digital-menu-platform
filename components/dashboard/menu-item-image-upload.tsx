"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { SecondaryButton } from "@/components/dashboard/ui/buttons";
import { FormField } from "@/components/dashboard/ui/form";
import type { CloudinaryUploadFolder } from "@/lib/cloudinary/folders";

type MenuItemImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  folder: CloudinaryUploadFolder;
  label?: string;
};

export function MenuItemImageUpload({
  value,
  onChange,
  folder,
  label,
}: MenuItemImageUploadProps) {
  const { dict } = useLocale();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fieldLabel = label ?? dict.menuItems.imageLabel;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage("");

      const signResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });

      const signResult = await signResponse.json();

      if (!signResponse.ok) {
        setMessage(signResult.error || dict.menuItems.createError);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signResult.apiKey);
      formData.append("timestamp", signResult.timestamp);
      formData.append("signature", signResult.signature);
      formData.append("folder", signResult.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signResult.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.secure_url) {
        setMessage(uploadResult.error?.message || dict.menuItems.createError);
        return;
      }

      onChange(uploadResult.secure_url);
      setMessage(dict.common.save);
    } catch {
      setMessage(dict.menuItems.createError);
    } finally {
      setUploading(false);
    }
  }

  return (
    <FormField label={fieldLabel}>
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-stone-600 file:me-3 file:rounded-lg file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />

        {uploading && (
          <p className="mt-3 text-sm text-stone-500">{dict.common.loading}</p>
        )}
        {message && (
          <p className="mt-3 text-sm text-emerald-700">{message}</p>
        )}

        {value && (
          <div className="mt-4 space-y-3">
            <img
              src={value}
              alt={fieldLabel}
              className="max-h-48 w-full rounded-xl object-cover ring-1 ring-stone-200/80 sm:max-w-xs"
            />
            <SecondaryButton type="button" onClick={() => onChange("")}>
              {dict.common.delete}
            </SecondaryButton>
          </div>
        )}
      </div>
    </FormField>
  );
}
