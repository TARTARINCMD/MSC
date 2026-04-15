export default function FindCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Image placeholder */}
      <div className="aspect-square w-full skeleton" />
      <div className="p-4 space-y-3">
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-5 w-10 rounded-full skeleton" />
          <div className="h-5 w-14 rounded-full skeleton" />
        </div>
        {/* Title */}
        <div className="h-5 w-3/4 rounded skeleton" />
        {/* Artist */}
        <div className="h-4 w-1/2 rounded skeleton" />
        {/* Date */}
        <div className="mt-4 h-3 w-1/3 rounded skeleton" />
      </div>
    </div>
  );
}
