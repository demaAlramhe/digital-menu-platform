export type StorePlan = "small" | "medium" | "large" | "custom";

export const PLAN_ITEM_LIMITS: Record<StorePlan, number | null> = {
  small: 25,
  medium: 50,
  large: 80,
  custom: null, // no automatic limit
};

export function getPlanItemLimit(plan: string): number | null {
  return PLAN_ITEM_LIMITS[plan as StorePlan] ?? PLAN_ITEM_LIMITS.large;
}
