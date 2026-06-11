export type AccessibilitySettings = {
  fontScale: number;
  highContrast: boolean;
  darkContrast: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
  bigCursor: boolean;
  reduceMotion: boolean;
  readableFont: boolean;
  underlineLinks: boolean;
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontScale: 1,
  highContrast: false,
  darkContrast: false,
  grayscale: false,
  highlightLinks: false,
  bigCursor: false,
  reduceMotion: false,
  readableFont: false,
  underlineLinks: false,
};

export const ACCESSIBILITY_STORAGE_KEY = "menuqr-a11y-settings";
export const MIN_FONT_SCALE = 0.9;
export const MAX_FONT_SCALE = 1.5;
export const FONT_SCALE_STEP = 0.1;
