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

    heroImageUrl: string;

    welcomeTitle: string;

    welcomeSubtitle: string;

    welcomeButtonText: string;

    showWelcomeScreen: boolean;

    defaultContentLanguage: string;

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

  const [heroImageUrl, setHeroImageUrl] = useState(store.heroImageUrl);

  const [welcomeTitle, setWelcomeTitle] = useState(store.welcomeTitle);

  const [welcomeSubtitle, setWelcomeSubtitle] = useState(store.welcomeSubtitle);

  const [welcomeButtonText, setWelcomeButtonText] = useState(

    store.welcomeButtonText

  );

  const [showWelcomeScreen, setShowWelcomeScreen] = useState(

    store.showWelcomeScreen

  );

  const [defaultContentLanguage, setDefaultContentLanguage] = useState(

    store.defaultContentLanguage

  );

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

          heroImageUrl,

          welcomeTitle,

          welcomeSubtitle,

          welcomeButtonText,

          showWelcomeScreen,

          defaultContentLanguage,

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

      setMessage(dict.settings.savedSuccess);

      router.refresh();

    } catch {

      setMessage(dict.menuItems.updateError);

    } finally {

      setLoading(false);

    }

  }



  return (

    <FormShell width="full" onSubmit={handleSubmit}>

      <FormSection title={dict.settings.title} description={dict.dashboard.cardSettingsDesc}>

        <FormField label={dict.settings.defaultContentLanguage}>

          <select

            value={defaultContentLanguage}

            onChange={(e) => setDefaultContentLanguage(e.target.value)}

            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 shadow-sm focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200/80"

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



      <FormSection title={`${dict.settings.logo} & ${dict.settings.banner}`}>

        <div className="grid gap-6 md:grid-cols-2">

          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">

            <MenuItemImageUpload

              value={logoUrl}

              onChange={setLogoUrl}

              folder={CLOUDINARY_FOLDERS.storeLogos}

              label={dict.settings.logo}

            />

            <p className="mt-2 text-xs text-stone-500">{dict.settings.logoDesc}</p>

          </div>

          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">

            <MenuItemImageUpload

              value={bannerUrl}

              onChange={setBannerUrl}

              folder={CLOUDINARY_FOLDERS.storeBanners}

              label={dict.settings.banner}

            />

            <p className="mt-2 text-xs text-stone-500">{dict.settings.bannerDesc}</p>

          </div>

        </div>

      </FormSection>



      <FormSection

        title={dict.settings.welcomeSection}

        description={dict.settings.welcomeSectionDesc}

      >

        <p className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-xs leading-relaxed text-amber-900">

          {dict.settings.autoTranslateHint}

        </p>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 px-4 py-3.5">

          <input

            type="checkbox"

            checked={showWelcomeScreen}

            onChange={(e) => setShowWelcomeScreen(e.target.checked)}

            className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300"

          />

          <span className="text-sm font-medium text-stone-800">

            {dict.settings.showWelcomeScreen}

          </span>

        </label>



        <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">

          <MenuItemImageUpload

            value={heroImageUrl}

            onChange={setHeroImageUrl}

            folder={CLOUDINARY_FOLDERS.storeHero}

            label={dict.settings.heroImage}

          />

        </div>



        <div className="mt-4 grid gap-4 md:grid-cols-2">

          <FormField label={dict.settings.welcomeTitle}>

            <FormInput

              value={welcomeTitle}

              onChange={(e) => setWelcomeTitle(e.target.value)}

              placeholder={dict.settings.welcomeTitlePlaceholder}

            />

          </FormField>

          <FormField label={dict.settings.welcomeButtonText}>

            <FormInput

              value={welcomeButtonText}

              onChange={(e) => setWelcomeButtonText(e.target.value)}

              placeholder={dict.settings.welcomeButtonPlaceholder}

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

        variant={message === dict.settings.savedSuccess ? "success" : message ? "error" : "muted"}

      />



      <PrimarySubmitButton disabled={loading}>

        {loading ? dict.common.saving : dict.settings.saveSettings}

      </PrimarySubmitButton>

    </FormShell>

  );

}


