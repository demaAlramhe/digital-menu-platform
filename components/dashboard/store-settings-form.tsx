"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { MenuItemImageUpload } from "@/components/dashboard/menu-item-image-upload";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary/folders";

type StoreSettingsFormProps = {
  store: {
    id: string;
    name: string;
    logoUrl: string;
    bannerUrl: string;
    primaryColor: string;
    secondaryColor: string;
    phone: string;
    email: string;
    address: string;
  };
};

export function StoreSettingsForm({ store }: StoreSettingsFormProps) {
  const router = useRouter();
  const { dict } = useLocale();

  const [name, setName] = useState(store.name);
  const [logoUrl, setLogoUrl] = useState(store.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(store.bannerUrl);
  const [primaryColor, setPrimaryColor] = useState(store.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(store.secondaryColor);
  const [phone, setPhone] = useState(store.phone);
  const [email, setEmail] = useState(store.email);
  const [address, setAddress] = useState(store.address);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage(dict.categories.requiredFields);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/store-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          logoUrl,
          bannerUrl,
          primaryColor,
          secondaryColor,
          phone,
          email,
          address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || dict.menuItems.updateError);
        return;
      }

      setMessage(dict.settings.saveSettings);
      router.refresh();
    } catch {
      setMessage(dict.menuItems.updateError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div>
        <label className="mb-1 block font-medium">{dict.common.name}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 font-medium">{dict.settings.logo}</p>
          <MenuItemImageUpload
            value={logoUrl}
            onChange={setLogoUrl}
            folder={CLOUDINARY_FOLDERS.storeLogos}
            label={dict.settings.logo}
          />
        </div>

        <div>
          <p className="mb-2 font-medium">{dict.settings.banner}</p>
          <MenuItemImageUpload
            value={bannerUrl}
            onChange={setBannerUrl}
            folder={CLOUDINARY_FOLDERS.storeBanners}
            label={dict.settings.banner}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-medium">
            {dict.settings.primaryColor}
          </label>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-12 w-full rounded-lg border px-2 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            {dict.settings.secondaryColor}
          </label>
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            className="h-12 w-full rounded-lg border px-2 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-medium">{dict.common.phone}</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">{dict.common.email}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-medium">{dict.common.address}</label>
        <textarea
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? dict.common.saving : dict.settings.saveSettings}
      </button>
    </form>
  );
}
