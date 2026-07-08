"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { brandAssets } from "@/lib/design/brand-tokens";

type HeroLogoTiltProps = {
  className?: string;
  priority?: boolean;
};

const MAX_TILT = 14;
const MAX_LIFT = 18;

export function HeroLogoTilt({
  className = "h-40 w-auto sm:h-48 md:h-56 lg:h-60",
  priority = true,
}: HeroLogoTiltProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const updateTilt = useCallback(
    (clientX: number, clientY: number) => {
      const el = wrapRef.current;
      if (!el || reduceMotion) return;

      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      const clampedX = Math.min(1, Math.max(0, x));
      const clampedY = Math.min(1, Math.max(0, y));

      const rotateY = (clampedX - 0.5) * (MAX_TILT * 2);
      const rotateX = (0.5 - clampedY) * (MAX_TILT * 2);

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        setTilt({ rotateX, rotateY });
      });
    },
    [reduceMotion]
  );

  const resetTilt = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const isActive = Math.abs(tilt.rotateX) + Math.abs(tilt.rotateY) > 0.5;

  return (
    <div
      ref={wrapRef}
      className={`hero-logo-tilt relative z-10 mx-auto -mb-2 inline-block touch-manipulation sm:-mb-3 lg:-mb-4 ${
        reduceMotion ? "" : "hero-logo-tilt--alive"
      }`}
      style={{ perspective: "900px" }}
      onMouseMove={(e) => updateTilt(e.clientX, e.clientY)}
      onMouseLeave={resetTilt}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        if (touch) updateTilt(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch) updateTilt(touch.clientX, touch.clientY);
      }}
      onTouchEnd={resetTilt}
    >
      <div
        className="hero-logo-tilt__card relative will-change-transform"
        style={{
          transform: reduceMotion
            ? undefined
            : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${
                isActive ? MAX_LIFT : 0
              }px)`,
          transformStyle: "preserve-3d",
          transition: reduceMotion ? undefined : "transform 120ms ease-out",
        }}
      >
        <Image
          src={brandAssets.logo}
          alt="Bel Afia — QR Menu"
          width={480}
          height={540}
          className={`relative w-auto object-contain drop-shadow-[0_16px_36px_rgba(59,67,80,0.2)] transition-[filter] duration-200 ${
            isActive ? "drop-shadow-[0_22px_48px_rgba(59,67,80,0.28)]" : ""
          } ${className}`.trim()}
          priority={priority}
          draggable={false}
        />
      </div>
    </div>
  );
}
