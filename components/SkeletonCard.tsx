export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-lg skeleton" />
        <div className="flex-1">
          <div className="h-4 w-3/4 rounded skeleton" />
          <div className="mt-2 h-3 w-1/2 rounded skeleton" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 rounded-full skeleton" />
        <div className="h-5 w-12 rounded-full skeleton" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1">
        <div className="h-4 w-14 rounded-full skeleton" />
        <div className="h-4 w-20 rounded-full skeleton" />
        <div className="h-4 w-16 rounded-full skeleton" />
      </div>
      <div className="mt-4 border-t pt-4 space-y-2">
        <div className="h-4 w-28 rounded skeleton" />
        <div className="h-4 w-20 rounded skeleton" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
