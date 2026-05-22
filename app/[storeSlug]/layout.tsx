import type { Metadata } from "next";
import { buildStorePublicMetadata } from "@/lib/store/public-metadata";

type StoreLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;
  return buildStorePublicMetadata(storeSlug, "welcome");
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return children;
}
