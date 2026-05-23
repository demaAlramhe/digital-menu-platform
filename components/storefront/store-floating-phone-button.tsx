"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { premiumGoldCtaStyle } from "@/lib/storefront/premium-theme";
import { normalizePhoneForTel } from "@/lib/utils/whatsapp";

type StoreFloatingPhoneButtonProps = {
  phone?: string | null;
  /** Persists drag position per store (e.g. store slug). */
  persistKey?: string;
};

type Position = { x: number; y: number };

const DRAG_THRESHOLD_PX = 8;
const VIEWPORT_PAD_PX = 10;
const ESTIMATED_WIDTH = 48;
const ESTIMATED_HEIGHT = 62;

function storageId(persistKey: string | undefined, phone: string) {
  const base = persistKey?.trim() || normalizePhoneForTel(phone);
  return `menu-contact-fab:${base}`;
}

function readStoredPosition(key: string): Position | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Position;
    if (
      typeof parsed?.x === "number" &&
      typeof parsed?.y === "number" &&
      Number.isFinite(parsed.x) &&
      Number.isFinite(parsed.y)
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function defaultPosition(): Position {
  if (typeof window === "undefined") {
    return { x: 16, y: 16 };
  }

  const safeBottom =
    typeof window !== "undefined"
      ? Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "env(safe-area-inset-bottom)"
          )
        ) || 0
      : 0;

  return {
    x: window.innerWidth - ESTIMATED_WIDTH - VIEWPORT_PAD_PX,
    y:
      window.innerHeight -
      ESTIMATED_HEIGHT -
      VIEWPORT_PAD_PX -
      Math.max(safeBottom, 12),
  };
}

function clampPosition(
  x: number,
  y: number,
  width: number,
  height: number
): Position {
  const maxX = window.innerWidth - width - VIEWPORT_PAD_PX;
  const maxY = window.innerHeight - height - VIEWPORT_PAD_PX;

  return {
    x: Math.min(maxX, Math.max(VIEWPORT_PAD_PX, x)),
    y: Math.min(maxY, Math.max(VIEWPORT_PAD_PX, y)),
  };
}

/** Draggable call button — customers can move it so it does not cover the menu. */
export function StoreFloatingPhoneButton({
  phone,
  persistKey,
}: StoreFloatingPhoneButtonProps) {
  const { dict } = useLocale();
  const trimmed = phone?.trim();
  const rootRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  const [position, setPosition] = useState<Position | null>(null);
  const positionRef = useRef<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const clampToViewport = useCallback((pos: Position): Position => {
    const el = rootRef.current;
    const width = el?.offsetWidth ?? ESTIMATED_WIDTH;
    const height = el?.offsetHeight ?? ESTIMATED_HEIGHT;
    return clampPosition(pos.x, pos.y, width, height);
  }, []);

  useLayoutEffect(() => {
    if (!trimmed) return;

    const key = storageId(persistKey, trimmed);
    const stored = readStoredPosition(key);
    const initial = stored ?? defaultPosition();
    setPosition(clampToViewport(initial));
    setReady(true);
  }, [trimmed, persistKey, clampToViewport]);

  useEffect(() => {
    if (!trimmed || !ready) return;

    function onResize() {
      setPosition((prev) => (prev ? clampToViewport(prev) : prev));
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [trimmed, ready, clampToViewport]);

  const persistPosition = useCallback(
    (pos: Position) => {
      if (!trimmed) return;
      try {
        window.localStorage.setItem(
          storageId(persistKey, trimmed),
          JSON.stringify(pos)
        );
      } catch {
        /* ignore quota / private mode */
      }
    },
    [trimmed, persistKey]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!position || e.button !== 0) return;

    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };

    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
      return;
    }

    drag.moved = true;

    const next = clampToViewport({
      x: drag.originX + dx,
      y: drag.originY + dy,
    });
    setPosition(next);
  };

  const finishPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (drag.pointerId !== e.pointerId) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    setIsDragging(false);

    if (drag.moved && positionRef.current) {
      persistPosition(positionRef.current);
    }

    dragState.current.pointerId = -1;
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (dragState.current.moved) {
      e.preventDefault();
    }
  };

  if (!trimmed) return null;

  const telHref = `tel:${normalizePhoneForTel(trimmed)}`;

  return (
    <div
      ref={rootRef}
      className={`fixed z-30 touch-none select-none ${ready ? "" : "pointer-events-none opacity-0"}`}
      style={
        position
          ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
          : undefined
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
    >
      <a
        href={telHref}
        onClick={handleClick}
        draggable={false}
        className={`flex flex-col items-center gap-1 rounded-xl border border-[#d4b87a]/50 bg-[rgba(12,10,8,0.78)] px-1.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md transition-[border-color,filter,transform] hover:border-[#d4b87a] hover:brightness-110 ${
          isDragging
            ? "scale-[1.02] cursor-grabbing border-[#d4b87a] shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
            : "cursor-grab active:scale-[0.97]"
        }`}
        aria-label={`${dict.store.contactTitle}: ${trimmed}`}
        title={dict.menu.dragContactHint}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={premiumGoldCtaStyle}
        >
          <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
        </span>
        <span className="pointer-events-none text-center text-[9px] font-medium leading-none text-[#f5e6c8]/95">
          {dict.store.contactTitle}
        </span>
      </a>
    </div>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.954l-1.293 1.293a1.125 1.125 0 0 0-.26 1.223 11.042 11.042 0 0 0 5.516 5.516 1.125 1.125 0 0 0 1.223-.26l1.293-1.293a1.875 1.875 0 0 1 1.954-.694l4.423 1.105a1.125 1.125 0 0 1 1.42 1.819V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
