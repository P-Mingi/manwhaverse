export function ManhwaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-[5/7] w-full animate-pulse rounded-lg bg-elevated" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-elevated" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-elevated" />
    </div>
  )
}
