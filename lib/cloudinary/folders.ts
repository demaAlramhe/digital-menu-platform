export const CLOUDINARY_FOLDERS = {
  storeLogos: "digital-menu-platform/store-logos",
  storeBanners: "digital-menu-platform/store-banners",
  menuItems: "digital-menu-platform/menu-items",
} as const;

export type CloudinaryUploadFolder =
  (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

export const ALLOWED_CLOUDINARY_FOLDERS: CloudinaryUploadFolder[] =
  Object.values(CLOUDINARY_FOLDERS);

export function isAllowedCloudinaryFolder(
  value: string
): value is CloudinaryUploadFolder {
  return ALLOWED_CLOUDINARY_FOLDERS.includes(value as CloudinaryUploadFolder);
}
