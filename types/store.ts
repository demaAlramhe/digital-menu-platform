export type Store = {
  id: string;
  slug: string;
  name: string;
  status: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
};

export type MenuCategory = {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type MenuItem = {
  id: string;
  storeId: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
};
