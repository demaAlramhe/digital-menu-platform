/** Public-facing stats shown on the homepage trust section. */
export const SITE_STATS = {
  /** Set to a number (e.g. 20) to show "+20 مطعم"; keep null to avoid fake counts. */
  restaurantsCount: null as number | null,
  languagesCount: 3,
  plansCount: 3,
} as const;
