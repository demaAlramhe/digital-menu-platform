import Link from "next/link";
import { StoreIntroLocaleBar } from "@/components/storefront/store-intro-locale-bar";
import { StorePremiumBackdrop } from "@/components/storefront/store-premium-backdrop";
import { StorePremiumGlass } from "@/components/storefront/store-premium-glass";
import {
  premiumGoldCtaStyle,
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_LIGHT,
} from "@/lib/storefront/premium-theme";
import type { ResolvedWelcomeContent } from "@/lib/store/welcome-content";

type StoreWelcomeScreenProps = {
  storeSlug: string;
  logoUrl: string | null;
  content: ResolvedWelcomeContent;
  menuHref?: string;
};

export function StoreWelcomeScreen({
  storeSlug,
  logoUrl,
  content,
  menuHref: menuHrefProp,
}: StoreWelcomeScreenProps) {
  const initial = content.headline?.charAt(0)?.toUpperCase() || "M";
  const menuHref = menuHrefProp ?? `/${storeSlug}/menu`;

  return (
    <main className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#0c0b0a] text-white">
      <StorePremiumBackdrop imageUrl={content.backgroundImageUrl} />

      <div className="relative z-10 flex h-full min-h-[100dvh] items-center justify-center px-4 py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <StorePremiumGlass className="max-w-sm py-6 sm:max-w-md sm:py-7">
          <div className="flex flex-col items-center gap-5 text-center sm:gap-6">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-24 w-24 rounded-full object-cover drop-shadow-lg ring-2 ring-amber-400/60 sm:h-28 sm:w-28"
              />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full font-serif text-4xl font-semibold drop-shadow-lg ring-2 ring-amber-400/60 sm:h-28 sm:w-28 sm:text-5xl"
                style={{
                  background: `linear-gradient(145deg, ${STOREFRONT_GOLD}33, rgba(0,0,0,0.4))`,
                  color: STOREFRONT_GOLD_LIGHT,
                  border: `1px solid ${STOREFRONT_GOLD}66`,
                }}
              >
                {initial}
              </div>
            )}

            <h1
              className="text-2xl font-bold tracking-wide sm:text-3xl"
              style={{ color: STOREFRONT_GOLD_LIGHT }}
            >
              {content.headline}
            </h1>

            <p className="max-w-[18rem] text-[14px] leading-relaxed text-white/88 sm:text-[15px]">
              {content.welcomeMessage}
            </p>

            <Link
              href={menuHref}
              className="flex w-full items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={premiumGoldCtaStyle}
            >
              {content.buttonText}
            </Link>

            <StoreIntroLocaleBar />
          </div>
        </StorePremiumGlass>
      </div>
    </main>
  );
}
