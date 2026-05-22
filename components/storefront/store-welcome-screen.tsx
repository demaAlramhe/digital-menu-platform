import Link from "next/link";
import { StoreIntroLocaleBar } from "@/components/storefront/store-intro-locale-bar";
import type { ResolvedWelcomeContent } from "@/lib/store/welcome-content";

const WELCOME_GOLD = "#C9A962";
const WELCOME_GOLD_LIGHT = "#E8D5A8";
const WELCOME_GOLD_DARK = "#9A7B3C";

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
      {content.backgroundImageUrl ? (
        <img
          src={content.backgroundImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#1a1510] via-[#0c0b0a] to-[#1f1812]"
          aria-hidden
        />
      )}

      <div className="absolute inset-0 bg-black/55" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/65"
        aria-hidden
      />

      <div className="relative z-10 flex h-full min-h-[100dvh] items-center justify-center px-4 py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div
          className="w-full max-w-[22rem] rounded-[1.625rem] px-8 py-10 sm:max-w-[24rem] sm:px-10 sm:py-12"
          style={{
            background: "rgba(12, 10, 8, 0.52)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${WELCOME_GOLD}`,
            boxShadow:
              "0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,169,98,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
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
                  background: `linear-gradient(145deg, ${WELCOME_GOLD}33, rgba(0,0,0,0.4))`,
                  color: WELCOME_GOLD_LIGHT,
                  border: `1px solid ${WELCOME_GOLD}66`,
                }}
              >
                {initial}
              </div>
            )}

            <h1
              className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem]"
              style={{ color: WELCOME_GOLD_LIGHT }}
            >
              {content.headline}
            </h1>

            <p className="mt-4 max-w-[18rem] text-[14px] leading-relaxed text-white/88 sm:text-[15px] sm:leading-relaxed">
              {content.welcomeMessage}
            </p>

            <Link
              href={menuHref}
              className="mt-8 flex min-h-[3.125rem] w-full max-w-[15rem] items-center justify-center rounded-full px-8 text-[15px] font-semibold tracking-wide transition active:scale-[0.98] hover:brightness-110 sm:mt-9 sm:min-h-[3.25rem] sm:text-base"
              style={{
                background: `linear-gradient(180deg, ${WELCOME_GOLD} 0%, ${WELCOME_GOLD_DARK} 100%)`,
                color: "#1a1408",
                boxShadow:
                  "0 8px 24px rgba(201,169,98,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              {content.buttonText}
            </Link>

            <StoreIntroLocaleBar />
          </div>
        </div>
      </div>
    </main>
  );
}
