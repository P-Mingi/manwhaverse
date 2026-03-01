export default function ManhwaLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <div className="h-[280px] w-[200px] flex-shrink-0 self-center rounded-lg bg-elevated md:self-start" />
          <div className="flex-1 space-y-4">
            <div className="h-10 w-3/4 rounded bg-elevated" />
            <div className="h-6 w-1/4 rounded bg-elevated" />
            <div className="h-12 w-1/3 rounded bg-elevated" />
            <div className="flex gap-2">
              <div className="h-7 w-16 rounded-md bg-elevated" />
              <div className="h-7 w-20 rounded-md bg-elevated" />
              <div className="h-7 w-14 rounded-md bg-elevated" />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-20 rounded-full bg-elevated" />
              <div className="h-7 w-16 rounded-full bg-elevated" />
              <div className="h-7 w-24 rounded-full bg-elevated" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-elevated" />
          <div className="h-4 w-5/6 rounded bg-elevated" />
          <div className="h-4 w-4/6 rounded bg-elevated" />
        </div>
      </div>
    </div>
  )
}
