"use client";

import { useId, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { SecondaryButton } from "@/components/dashboard/ui/buttons";
import { dash } from "@/components/dashboard/ui/styles";
import type { CloudinaryUploadFolder } from "@/lib/cloudinary/folders";

type MenuItemImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  folder: CloudinaryUploadFolder;
  label?: string;
  /** Notifies parent when an upload starts/finishes so Save can wait. */
  onUploadingChange?: (uploading: boolean) => void;
};

export function MenuItemImageUpload({
  value,
  onChange,
  folder,
  label,
  onUploadingChange,
}: MenuItemImageUploadProps) {
  const { dict } = useLocale();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const fieldLabel = label ?? dict.menuItems.imageLabel;

  function setUploadBusy(next: boolean) {
    setUploading(next);
    onUploadingChange?.(next);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (process.env.NODE_ENV === "development") {
      console.log("[image-upload] file change", {
        folder,
        hasFile: Boolean(file),
        name: file?.name,
        size: file?.size,
        type: file?.type,
      });
    }

    if (!file) {
      setSelectedName("");
      return;
    }

    setSelectedName(file.name);
    setError("");
    setSuccess("");
    setUploadBusy(true);

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[image-upload] requesting /api/cloudinary/sign", { folder });
      }

      const signResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });

      const signResult = (await signResponse.json()) as {
        error?: string;
        apiKey?: string;
        timestamp?: string;
        signature?: string;
        folder?: string;
        cloudName?: string;
      };

      if (process.env.NODE_ENV === "development") {
        console.log("[image-upload] sign response", {
          ok: signResponse.ok,
          status: signResponse.status,
          error: signResult.error,
          cloudName: signResult.cloudName,
          folder: signResult.folder,
        });
      }

      if (!signResponse.ok || !signResult.apiKey || !signResult.signature) {
        setError(signResult.error || dict.menuItems.createError);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signResult.apiKey.trim());
      formData.append("timestamp", String(signResult.timestamp).trim());
      formData.append("signature", signResult.signature.trim());
      formData.append("folder", (signResult.folder || folder).trim());

      if (process.env.NODE_ENV === "development") {
        console.log("[image-upload] uploading to Cloudinary", {
          cloudName: signResult.cloudName,
          folder: signResult.folder || folder,
          timestamp: signResult.timestamp,
        });
      }

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${String(signResult.cloudName).trim()}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploadResult = (await uploadResponse.json()) as {
        secure_url?: string;
        error?: { message?: string };
      };

      if (process.env.NODE_ENV === "development") {
        console.log("[image-upload] cloudinary response", {
          ok: uploadResponse.ok,
          status: uploadResponse.status,
          hasUrl: Boolean(uploadResult.secure_url),
          error: uploadResult.error?.message,
        });
      }

      if (!uploadResponse.ok || !uploadResult.secure_url) {
        const cloudinaryMessage = uploadResult.error?.message;
        setError(
          cloudinaryMessage
            ? `Cloudinary: ${cloudinaryMessage}`
            : dict.menuItems.createError
        );
        return;
      }

      onChange(uploadResult.secure_url);
      setSuccess(dict.common.save);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[image-upload] unexpected error", err);
      }
      setError(dict.menuItems.createError);
    } finally {
      setUploadBusy(false);
      // Allow selecting the same file again if needed.
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className={dash.label}>
        {fieldLabel}
      </label>

      <div className={`${dash.uploadZone} mt-1.5`}>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full cursor-pointer text-sm text-stone-600 file:me-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-dark file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-dark-hover disabled:cursor-not-allowed disabled:opacity-60"
        />

        {selectedName && !uploading && !success && !error && (
          <p className="mt-2 text-xs text-stone-500">{selectedName}</p>
        )}

        {uploading && (
          <p className="mt-3 text-sm font-medium text-brand-dark">
            {dict.common.loading}
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-3 text-sm font-medium text-emerald-700" role="status">
            {success}
          </p>
        )}

        {value ? (
          <div className="mt-4 space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={fieldLabel}
              className="max-h-48 w-full rounded-xl object-cover ring-1 ring-stone-200/80 sm:max-w-xs"
            />
            <SecondaryButton
              type="button"
              disabled={uploading}
              onClick={() => {
                onChange("");
                setSelectedName("");
                setSuccess("");
                setError("");
              }}
            >
              {dict.common.delete}
            </SecondaryButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
