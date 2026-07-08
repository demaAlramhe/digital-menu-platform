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
import { appendTranslationNote } from "@/lib/dashboard/translation-feedback";
import { getTranslationStatusFromResponse } from "@/lib/dashboard/parse-save-response";
import { RetranslateContentButton } from "@/components/dashboard/retranslate-content-button";

type StoreSettingsFormProps = {
  store: {
    id: string;
    name: string;
    logoUrl: string;
    bannerUrl: string;
    heroImageUrl: string;
    menuBackgroundUrl: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    welcomeButtonText: string;
    defaultContentLanguage: string;
    primaryColor: string;
    secondaryColor: string;
    phone: string;
    whatsappNumber: string;
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
  const [heroImageUrl, setHeroImageUrl] = useState(store.heroImageUrl);
  const [menuBackgroundUrl, setMenuBackgroundUrl] = useState(
    store.menuBackgroundUrl
  );
  const [welcomeTitle, setWelcomeTitle] = useState(store.welcomeTitle);
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(store.welcomeSubtitle);
  const [welcomeButtonText, setWelcomeButtonText] = useState(
    store.welcomeButtonText
  );
  const [defaultContentLanguage, setDefaultContentLanguage] = useState(
    store.defaultContentLanguage
  );
  const [primaryColor, setPrimaryColor] = useState(store.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(store.secondaryColor);
  const [phone, setPhone] = useState(store.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(store.whatsappNumber);
  const [email, setEmail] = useState(store.email);
  const [address, setAddress] = useState(store.address);
  const [loading, setLoading] = useState(false);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [message, setMessage] = useState("");

  function trackUpload(uploading: boolean) {
    setPendingUploads((count) =>
      uploading ? count + 1 : Math.max(0, count - 1)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage(dict.categories.requiredFields);
      return;
    }

    if (pendingUploads > 0) {
      setMessage(dict.settings.waitForUpload);
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
          heroImageUrl,
          menuBackgroundUrl,
          welcomeTitle,
          welcomeSubtitle,
          welcomeButtonText,
          showWelcomeScreen: true,
          defaultContentLanguage,
          primaryColor,
          secondaryColor,
          phone,
          whatsapp_number: whatsappNumber,
          email,
          address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || dict.menuItems.updateError);
        return;
      }

      const baseMessage = appendTranslationNote(
        dict,
        dict.settings.savedSuccess,
        getTranslationStatusFromResponse(result)
      );
      setMessage(
        typeof result.migrationWarning === "string"
          ? `${baseMessage} ${result.migrationWarning}`
          : baseMessage
      );

      router.refresh();
    } catch {
      setMessage(dict.menuItems.updateError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell width="full" onSubmit={handleSubmit}>
      <FormSection
        title={dict.settings.title}
        description={dict.dashboard.cardSettingsDesc}
      >
        <FormField label={dict.settings.defaultContentLanguage}>
          <select
            value={defaultContentLanguage}
            onChange={(e) => setDefaultContentLanguage(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 shadow-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          >
            <option value="ar">{dict.lang.ar}</option>
            <option value="he">{dict.lang.he}</option>
            <option value="en">{dict.lang.en}</option>
          </select>
          <p className="mt-1.5 text-xs text-stone-500">
            {dict.settings.defaultContentLanguageHint}
          </p>
        </FormField>

        <FormField label={dict.common.name}>
          <FormInput value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
      </FormSection>

      <FormSection title={dict.settings.logo}>
        <div className="max-w-md rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">
          <MenuItemImageUpload
            value={logoUrl}
            onChange={setLogoUrl}
            folder={CLOUDINARY_FOLDERS.storeLogos}
            label={dict.settings.logo}
            onUploadingChange={trackUpload}
          />
          <p className="mt-2 text-xs text-stone-500">{dict.settings.logoDesc}</p>
        </div>
      </FormSection>

      <FormSection
        title={dict.settings.welcomeSection}
        description={dict.settings.welcomeSectionDesc}
      >
        <p className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
          {dict.settings.autoTranslateHint}
        </p>

        <div className="mb-4">
          <RetranslateContentButton />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">
            <MenuItemImageUpload
              value={bannerUrl}
              onChange={setBannerUrl}
              folder={CLOUDINARY_FOLDERS.storeBanners}
              label={dict.settings.banner}
              onUploadingChange={trackUpload}
            />
            <p className="mt-2 text-xs text-stone-500">{dict.settings.bannerDesc}</p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">
            <MenuItemImageUpload
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              folder={CLOUDINARY_FOLDERS.storeHero}
              label={dict.settings.heroImage}
              onUploadingChange={trackUpload}
            />
            <p className="mt-2 text-xs text-stone-500">
              {dict.settings.heroImageDesc}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <FormField label={dict.settings.welcomeTitle}>
            <FormInput
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              placeholder={dict.settings.welcomeTitlePlaceholder}
            />
          </FormField>
        </div>

        <FormField label={dict.settings.welcomeSubtitle}>
          <FormTextarea
            rows={2}
            value={welcomeSubtitle}
            onChange={(e) => setWelcomeSubtitle(e.target.value)}
            placeholder={dict.settings.welcomeSubtitlePlaceholder}
          />
        </FormField>

        <FormField label={dict.settings.welcomeButtonText}>
          <FormInput
            value={welcomeButtonText}
            onChange={(e) => setWelcomeButtonText(e.target.value)}
            placeholder={dict.settings.welcomeButtonPlaceholder}
          />
        </FormField>

        <p className="text-xs text-stone-500">{dict.settings.welcomeCtaNote}</p>
      </FormSection>

      <FormSection
        title={dict.settings.menuSection}
        description={dict.settings.menuSectionDesc}
      >
        <div className="max-w-md rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">
          <MenuItemImageUpload
            value={menuBackgroundUrl}
            onChange={setMenuBackgroundUrl}
            folder={CLOUDINARY_FOLDERS.storeMenuBackgrounds}
            label={dict.settings.menuBackground}
            onUploadingChange={trackUpload}
          />
          <p className="mt-2 text-xs text-stone-500">
            {dict.settings.menuBackgroundDesc}
          </p>
        </div>
      </FormSection>

      <FormSection
        title={`${dict.settings.primaryColor} / ${dict.settings.secondaryColor}`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={dict.settings.primaryColor}>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-12 w-14 cursor-pointer rounded-lg border border-stone-200 bg-white p-1"
              />
              <FormInput
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="font-mono text-sm"
              />
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
              <FormInput
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </FormField>
        </div>
      </FormSection>

      <FormSection>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={dict.common.phone}>
            <FormInput value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>

          <FormField label={dict.settings.whatsappNumber}>
            <FormInput
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder={dict.settings.whatsappPlaceholder}
            />
          </FormField>

          <FormField label={dict.common.email}>
            <FormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label={dict.common.address}>
          <FormTextarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </FormField>
      </FormSection>

      <FormMessage
        message={message}
        variant={
          message.startsWith(dict.settings.savedSuccess)
            ? "success"
            : message
              ? "error"
              : "muted"
        }
      />

      <PrimarySubmitButton disabled={loading || pendingUploads > 0}>
        {pendingUploads > 0
          ? dict.common.loading
          : loading
            ? dict.common.translating
            : dict.settings.saveSettings}
      </PrimarySubmitButton>
    </FormShell>
  );
}
