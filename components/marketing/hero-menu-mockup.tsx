import {
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_LIGHT,
  STOREFRONT_BG,
} from "@/lib/storefront/premium-theme";

type MenuItem = {
  emoji: string;
  name: string;
  price: string;
};

type HeroMenuMockupProps = {
  storeName: string;
  items: MenuItem[];
  ariaLabel: string;
};

export function HeroMenuMockup({
  storeName,
  items,
  ariaLabel,
}: HeroMenuMockupProps) {
  return (
    <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[260px] lg:mx-0 lg:max-w-none">
      <div
        className="pointer-events-none absolute inset-6 rounded-[2.5rem] bg-amber-400/25 blur-3xl"
        aria-hidden
      />

      <div
        className="relative mx-auto w-[240px] rounded-[2.5rem] border-8 border-stone-900 bg-stone-900 shadow-2xl sm:w-[260px] lg:w-[280px]"
        style={{ aspectRatio: "9 / 19" }}
        role="img"
        aria-label={ariaLabel}
      >
        <div className="absolute start-1/2 top-2.5 h-1 w-16 -translate-x-1/2 rounded-full bg-stone-800" />

        <div
          className="flex h-full flex-col overflow-hidden rounded-[1.75rem]"
          style={{ backgroundColor: STOREFRONT_BG }}
        >
          <div className="border-b border-amber-400/20 px-4 pb-3 pt-8 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ring-2 ring-amber-400/60"
              style={{
                background: `linear-gradient(145deg, ${STOREFRONT_GOLD}33, rgba(0,0,0,0.4))`,
                color: STOREFRONT_GOLD_LIGHT,
              }}
            >
              {storeName.charAt(0)}
            </div>
            <p
              className="mt-2 text-sm font-bold tracking-wide"
              style={{ color: STOREFRONT_GOLD_LIGHT }}
            >
              {storeName}
            </p>
          </div>

          <div className="flex-1 space-y-2.5 overflow-hidden px-3 py-3">
            {items.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2.5 rounded-xl border border-amber-400/25 bg-stone-900/80 px-2.5 py-2"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-lg"
                  aria-hidden
                >
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white/90">
                    {item.name}
                  </p>
                  <p
                    className="text-[11px] font-bold tabular-nums"
                    style={{ color: STOREFRONT_GOLD }}
                  >
                    {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-amber-400/15 px-3 py-2">
            <div className="flex justify-center gap-1">
              {["ar", "en", "he"].map((code) => (
                <span
                  key={code}
                  className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                    code === "ar"
                      ? "bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/50"
                      : "text-white/50"
                  }`}
                >
                  {code === "ar" ? "عربي" : code === "en" ? "EN" : "עב"}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
