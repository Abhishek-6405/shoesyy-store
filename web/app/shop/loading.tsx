import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="py-8 sm:py-12">
      <Container>
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>

        {/* Layout Skeleton */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-64 shrink-0 pr-6">
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-full rounded" />
                <Skeleton className="h-6 w-full rounded" />
              </div>
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/60 p-0"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-4 w-14 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
