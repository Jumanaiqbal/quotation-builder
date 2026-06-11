export const SkeletonCard = () => (
  <div className="rounded-lg border border-cream-dark bg-white p-6 animate-pulse">
    <div className="h-4 bg-cream-dark rounded w-1/3 mb-3" />
    <div className="h-3 bg-cream-dark rounded w-1/2 mb-2" />
    <div className="h-3 bg-cream-dark rounded w-2/3" />
  </div>
)

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 py-3 animate-pulse">
    <div className="h-8 w-8 bg-cream-dark rounded-full shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-cream-dark rounded w-1/3" />
      <div className="h-3 bg-cream-dark rounded w-1/4" />
    </div>
    <div className="h-3 bg-cream-dark rounded w-24" />
  </div>
)
