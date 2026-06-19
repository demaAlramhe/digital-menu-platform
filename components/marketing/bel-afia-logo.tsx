import Image from "next/image";
import { brandAssets } from "@/lib/design/brand-tokens";

type BelAfiaLogoProps = {
  variant?: "full" | "compact";
  className?: string;
  priority?: boolean;
};

export function BelAfiaLogo({
  variant = "full",
  className = "",
  priority = false,
}: BelAfiaLogoProps) {
  if (variant === "compact") {
    return (
      <Image
        src={brandAssets.icon}
        alt="Bel Afia"
        width={64}
        height={64}
        className={`h-8 w-8 object-contain ${className}`.trim()}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={brandAssets.logo}
      alt="Bel Afia — QR Menu"
      width={320}
      height={360}
      className={`h-11 w-auto origin-start scale-[1.45] object-contain object-start sm:h-12 sm:scale-[1.55] ${className}`.trim()}
      priority={priority}
    />
  );
}
