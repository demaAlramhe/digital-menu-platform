import Image from "next/image";
import Link from "next/link";

type HeroMenuMockupProps = {
  imageSrc: string;
  ariaLabel: string;
  tryLabel?: string;
  href?: string;
};

export function HeroMenuMockup({
  imageSrc,
  ariaLabel,
  tryLabel,
  href,
}: HeroMenuMockupProps) {
  const phone = (
    <div
      className="relative mx-auto w-[240px] rounded-[2.5rem] border-8 border-stone-900 bg-stone-900 shadow-2xl transition hover:shadow-[0_25px_50px_rgba(59,67,80,0.28)] sm:w-[260px] lg:w-[280px]"
      style={{ aspectRatio: "9 / 19" }}
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
  );

  return (
    <div
      className={`relative mx-auto w-full max-w-[240px] sm:max-w-[260px] lg:mx-0 lg:max-w-none ${
        href ? "pb-8" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute inset-6 rounded-[2.5rem] bg-brand-dark/15 blur-3xl"
        aria-hidden
      />

      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className="relative block rounded-[2.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2"
        >
          {phone}
          {tryLabel ? (
            <span className="absolute -bottom-4 start-1/2 z-10 -translate-x-1/2 rtl:translate-x-1/2">
              <span
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-dark px-4 py-2 text-xs font-semibold text-white shadow-lg motion-safe:animate-[mockup-nudge_2.4s_ease-in-out_infinite]"
                aria-hidden
              >
                <span aria-hidden>👆</span>
                {tryLabel}
              </span>
            </span>
          ) : null}
        </Link>
      ) : (
        <div role="img" aria-label={ariaLabel}>
          {phone}
        </div>
      )}
    </div>
  );
}
