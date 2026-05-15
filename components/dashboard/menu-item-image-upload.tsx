"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
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
        headers: {
          "Content-Type": "application/json",
        },
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
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        setMessage(uploadResult.error?.message || dict.menuItems.createError);
        return;
      }

      if (!uploadResult.secure_url) {
        setMessage(dict.menuItems.createError);
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
    <div className="space-y-3">
      <div>
        <label className="mb-1 block font-medium">{fieldLabel}</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full rounded-lg border px-3 py-2"
        />
      </div>

      {uploading && (
        <p className="text-sm text-slate-600">{dict.common.loading}</p>
      )}
      {message && <p className="text-sm text-slate-600">{message}</p>}

      {value && (
        <div className="space-y-2">
          <img
            src={value}
            alt={fieldLabel}
            className="h-40 w-40 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            {dict.common.delete}
          </button>
        </div>
      )}
    </div>
  );
}
