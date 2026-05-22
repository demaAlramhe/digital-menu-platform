import type { Metadata } from "next";
import { buildStorePublicMetadata } from "@/lib/store/public-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;
  return buildStorePublicMetadata(storeSlug, "menu");
}

export default function StoreMenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
