const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-gray-200 dark:bg-neutral-800 animate-pulse">
    <div className="h-48 bg-gray-300 dark:bg-neutral-700" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 bg-gray-300 dark:bg-neutral-700 rounded" />
      <div className="h-3 w-1/2 bg-gray-300 dark:bg-neutral-700 rounded" />
      <div className="flex gap-3">
        <div className="h-3 w-10 bg-gray-300 dark:bg-neutral-700 rounded" />
        <div className="h-3 w-10 bg-gray-300 dark:bg-neutral-700 rounded" />
      </div>
    </div>
  </div>
);
export default SkeletonCard;