import { z } from "zod";
import { isAllowedCloudinaryFolder } from "@/lib/cloudinary/folders";

const optionalString = z.string().optional();
const nullableString = z.string().nullable().optional();
const optionalUrl = z.string().url().or(z.literal("")).optional();

export const contentLocaleSchema = z.enum(["ar", "he", "en"]);

export const storeSettingsPatchSchema = z.object({
  name: z.string().trim().min(1, "Store name is required."),
  logoUrl: optionalUrl,
  bannerUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  menuBackgroundUrl: optionalUrl,
  welcomeTitle: optionalString,
  welcomeSubtitle: optionalString,
  welcomeButtonText: optionalString,
  showWelcomeScreen: z.boolean().optional(),
  defaultContentLanguage: contentLocaleSchema.optional(),
  primaryColor: optionalString,
  secondaryColor: optionalString,
  phone: optionalString,
  whatsapp_number: z.string().optional().nullable(),
  email: z.string().email().or(z.literal("")).optional(),
  address: optionalString,
});

export const menuCategoryPostSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  slug: z.string().trim().min(1, "Slug is required."),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const menuCategoryPatchSchema = menuCategoryPostSchema;

export const menuItemPostSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  slug: z.string().trim().min(1, "Slug is required."),
  description: optionalString,
  price: z.number({ message: "Price is required." }).nonnegative(),
  original_price: z.number().positive().optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  imageUrl: optionalUrl,
  categoryId: z.string().uuid().nullable().optional(),
});

export const menuItemPatchSchema = menuItemPostSchema;

export const cloudinarySignSchema = z.object({
  folder: z
    .string()
    .refine(
      (value) => isAllowedCloudinaryFolder(value),
      "Invalid or missing Cloudinary upload folder."
    ),
});

export const localePostSchema = z.object({
  locale: contentLocaleSchema,
});

export const adminCreateStoreSchema = z.object({
  storeName: z.string().trim().min(1),
  storeSlug: z.string().trim().min(1),
  ownerEmail: z.string().trim().email(),
  ownerPassword: z.string().min(6),
  ownerFullName: z.string().trim().min(1),
  phone: optionalString,
  email: z.string().email().or(z.literal("")).optional(),
  address: optionalString,
});

export const adminPatchStoreSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  logoUrl: optionalUrl,
  bannerUrl: optionalUrl,
  primaryColor: optionalString,
  secondaryColor: optionalString,
  phone: optionalString,
  email: z.string().email().or(z.literal("")).optional(),
  address: optionalString,
  status: z.enum(["active", "inactive", "archived"]).optional(),
});

export const adminStoreStatusSchema = z.object({
  status: z.enum(["active", "inactive", "archived"]),
});

export const adminUserRoleSchema = z.object({
  role: z.enum(["super_admin", "store_owner"]),
});

export const adminUserStoreSchema = z.object({
  storeId: z.string().uuid().nullable(),
});

export const adminUserProfilePatchSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(120, "Full name is too long."),
  email: z.string().trim().email("A valid email is required."),
});

export const adminUserPasswordPatchSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm the password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const signupPlanSchema = z.enum(["small", "medium", "large"]);

export const signupPostSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required."),
  restaurant_name: z.string().trim().min(1, "Restaurant name is required."),
  email: z.string().trim().email("A valid email is required."),
  whatsapp: z.string().trim().min(5, "WhatsApp number is required."),
  plan: z.enum(["small", "medium", "large"]),
  notes: z.string().trim().optional().nullable(),
  estimated_items: z.string().optional().nullable(),
});
