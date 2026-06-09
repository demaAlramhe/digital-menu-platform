function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/10 ${className ?? ""}`}
    />
  );
}

export function CategoryPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Back button skeleton */}
      <SkeletonBox className="mb-6 h-8 w-24" />

      {/* Category title */}
      <SkeletonBox className="mx-auto mb-6 h-8 w-40" />

      {/* Item cards grid — show 6 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl bg-white/5 p-3">
            <SkeletonBox className="aspect-square w-full rounded-lg" />
            <SkeletonBox className="h-4 w-3/4" />
            <SkeletonBox className="h-3 w-full" />
            <SkeletonBox className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
