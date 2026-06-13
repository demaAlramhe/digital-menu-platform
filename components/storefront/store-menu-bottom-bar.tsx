"use client";

import { AccessibilityMenuControl } from "@/components/accessibility/accessibility-widget";
import { StoreMenuPhoneButton } from "@/components/storefront/store-menu-phone-button";

type StoreMenuBottomBarProps = {
  phone?: string | null;
};

const BOTTOM_OFFSET = "bottom-[max(1rem,env(safe-area-inset-bottom))]";

export function StoreMenuBottomBar({ phone }: StoreMenuBottomBarProps) {
  return (
    <>
      <div className={`fixed ${BOTTOM_OFFSET} left-4 z-[35] sm:left-5`}>
        <AccessibilityMenuControl />
      </div>
      <div className={`fixed ${BOTTOM_OFFSET} right-4 z-[35] sm:right-5`}>
        <StoreMenuPhoneButton phone={phone} />
      </div>
    </>
  );
}
