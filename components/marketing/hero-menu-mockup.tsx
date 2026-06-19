import Image from "next/image";

type HeroMenuMockupProps = {
  imageSrc: string;
  ariaLabel: string;
};

export function HeroMenuMockup({ imageSrc, ariaLabel }: HeroMenuMockupProps) {
  return (
    <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[260px] lg:mx-0 lg:max-w-none">
      <div
        className="pointer-events-none absolute inset-6 rounded-[2.5rem] bg-brand-dark/15 blur-3xl"
        aria-hidden
      />

      <div
        className="relative mx-auto w-[240px] rounded-[2.5rem] border-8 border-stone-900 bg-stone-900 shadow-2xl sm:w-[260px] lg:w-[280px]"
        style={{ aspectRatio: "9 / 19" }}
        role="img"
        aria-label={ariaLabel}
      >
        <div className="absolute start-1/2 top-2.5 z-10 h-1 w-16 -translate-x-1/2 rounded-full bg-stone-800" />

        <div className="relative h-full overflow-hidden rounded-[1.75rem]">
          <Image
            src={imageSrc}
            alt={ariaLabel}
            fill
            className="object-cover object-top"
            priority
            sizes="(max-width: 640px) 224px, (max-width: 1024px) 244px, 264px"
          />
        </div>
      </div>
    </div>
  );
}
