"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { MenuItemImageUpload } from "@/components/dashboard/menu-item-image-upload";
import { PrimarySubmitButton } from "@/components/dashboard/ui/buttons";
import {
  FormField,
  FormInput,
  FormMessage,
  FormSection,
  FormShell,
  FormTextarea,
} from "@/components/dashboard/ui/form";
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
        headers: { "Content-Type": "application/json" },
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
    <FormShell onSubmit={handleSubmit}>
      <FormSection title={dict.settings.title} description={dict.dashboard.cardSettingsDesc}>
        <FormField label={dict.common.name}>
          <FormInput value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
      </FormSection>

      <FormSection title={`${dict.settings.logo} & ${dict.settings.banner}`}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">
            <MenuItemImageUpload
              value={logoUrl}
              onChange={setLogoUrl}
              folder={CLOUDINARY_FOLDERS.storeLogos}
              label={dict.settings.logo}
            />
          </div>
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">
            <MenuItemImageUpload
              value={bannerUrl}
              onChange={setBannerUrl}
              folder={CLOUDINARY_FOLDERS.storeBanners}
              label={dict.settings.banner}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title={`${dict.settings.primaryColor} / ${dict.settings.secondaryColor}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={dict.settings.primaryColor}>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-12 w-14 cursor-pointer rounded-lg border border-stone-200 bg-white p-1"
              />
              <FormInput value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono text-sm" />
            </div>
          </FormField>
          <FormField label={dict.settings.secondaryColor}>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-12 w-14 cursor-pointer rounded-lg border border-stone-200 bg-white p-1"
              />
              <FormInput value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="font-mono text-sm" />
            </div>
          </FormField>
        </div>
      </FormSection>

      <FormSection>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={dict.common.phone}>
            <FormInput value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>
          <FormField label={dict.common.email}>
            <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
        </div>
        <FormField label={dict.common.address}>
          <FormTextarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormField>
      </FormSection>

      <FormMessage
        message={message}
        variant={message === dict.settings.saveSettings ? "success" : message ? "error" : "muted"}
      />

      <PrimarySubmitButton disabled={loading}>
        {loading ? dict.common.saving : dict.settings.saveSettings}
      </PrimarySubmitButton>
    </FormShell>
  );
}
