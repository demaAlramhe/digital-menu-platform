import { MenuPageSkeleton } from "@/components/storefront/skeletons/menu-skeleton";

export default function Loading() {
  return (
    <main className="relative min-h-screen bg-stone-900">
      <MenuPageSkeleton />
    </main>
  );
}
