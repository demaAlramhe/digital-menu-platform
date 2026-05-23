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
        <StorePremiumGlass>
          <div className="flex flex-col items-center text-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="mb-6 h-20 w-20 rounded-full object-cover ring-2 ring-[#d4b87a]/40 sm:h-[5.5rem] sm:w-[5.5rem]"
              />
            ) : (
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold sm:h-[5.5rem] sm:w-[5.5rem]"
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
              className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem]"
              style={{ color: STOREFRONT_GOLD_LIGHT }}
            >
              {content.headline}
            </h1>

            <p className="mt-4 max-w-[18rem] text-[14px] leading-relaxed text-white/88 sm:text-[15px] sm:leading-relaxed">
              {content.welcomeMessage}
            </p>

            <Link
              href={menuHref}
              className="mt-8 flex min-h-[3.125rem] w-full max-w-[15rem] items-center justify-center rounded-full px-8 text-[15px] font-semibold tracking-wide transition active:scale-[0.98] hover:brightness-110 sm:mt-9 sm:min-h-[3.25rem] sm:text-base"
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
