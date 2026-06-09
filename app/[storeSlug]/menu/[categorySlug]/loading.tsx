import { CategoryPageSkeleton } from "@/components/storefront/skeletons/category-skeleton";

export default function Loading() {
  return (
    <main className="relative min-h-screen bg-stone-900">
      <CategoryPageSkeleton />
    </main>
  );
}
