import type { Database } from "@/types/db";

export type StoreRow = Database["public"]["Tables"]["stores"]["Row"];
export type MenuCategoryRow = Database["public"]["Tables"]["menu_categories"]["Row"];
export type MenuItemRow = Database["public"]["Tables"]["menu_items"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
