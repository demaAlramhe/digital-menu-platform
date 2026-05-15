import type { Dictionary } from "./types";

export type DisplayRole = "super_admin" | "store_owner";

export function getRoleLabel(
  role: string | null | undefined,
  dict: Dictionary
): string {
  if (role === "super_admin") return dict.roles.superAdmin;
  if (role === "store_owner") return dict.roles.storeOwner;
  return role ?? "—";
}

export function isDisplayRole(role: string): role is DisplayRole {
  return role === "super_admin" || role === "store_owner";
}
