function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/10 ${className ?? ""}`}
    />
  );
}

export function MenuPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      {/* Logo + store name */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <SkeletonBox className="h-20 w-20 rounded-full" />
        <SkeletonBox className="h-4 w-32" />
        <SkeletonBox className="h-8 w-24" />
      </div>

      {/* Offers skeleton */}
      <div className="mb-6">
        <SkeletonBox className="mb-3 h-6 w-32" />
        <div className="flex gap-3 overflow-x-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex min-w-[160px] flex-col gap-2">
              <SkeletonBox className="aspect-square w-full rounded-lg" />
              <SkeletonBox className="h-4 w-3/4" />
              <SkeletonBox className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>

      {/* Category rows — show 5 */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex h-20 items-center justify-between rounded-xl bg-white/5 px-4"
          >
            <div className="flex flex-col gap-2">
              <SkeletonBox className="h-4 w-28" />
              <SkeletonBox className="h-3 w-16" />
            </div>
            <SkeletonBox className="h-16 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
