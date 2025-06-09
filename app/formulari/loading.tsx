import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the formulari table
 */
export function FormulariTableSkeleton() {
  return (
    <div className="space-y-4 w-full h-full">
      {/* Search and filter controls skeleton */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border w-full flex-1 flex flex-col min-h-[500px]">
        <div className="relative w-full overflow-x-auto flex-1 flex flex-col">
          {/* Table header */}
          <div className="sticky top-0 z-10 w-full border-b bg-background p-4">
            <div className="flex space-x-4">
              <Skeleton className="h-6 w-[50px]" />
              <Skeleton className="h-6 w-[120px]" />
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-6 w-[80px]" />
            </div>
          </div>
          {/* Table body */}
          <div className="flex-1 p-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex space-x-4 mb-3">
                <Skeleton className="h-8 w-[50px]" />
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[150px]" />
                <Skeleton className="h-8 w-[150px]" />
                <Skeleton className="h-8 w-[150px]" />
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[80px]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between space-x-2 py-4 w-full">
        <Skeleton className="h-8 w-[150px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[80px]" />
          <Skeleton className="h-8 w-[80px]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Default loading component for the page
 */
export default function Loading() {
  return <FormulariTableSkeleton />;
}
