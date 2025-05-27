import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading skeleton for the formulari table
 */
export function FormulariTableSkeleton() {
	return (
		<div className="space-y-4">
			{/* Search and filter controls skeleton */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Skeleton className="h-10 w-[300px]" />
					<Skeleton className="h-10 w-[180px]" />
				</div>
				<Skeleton className="h-10 w-[120px]" />
			</div>

			{/* Table skeleton */}
			<div className="rounded-md border">
				<div className="p-4">
					{/* Header */}
					<div className="flex space-x-4 mb-4">
						<Skeleton className="h-6 w-[50px]" />
						<Skeleton className="h-6 w-[120px]" />
						<Skeleton className="h-6 w-[100px]" />
						<Skeleton className="h-6 w-[150px]" />
						<Skeleton className="h-6 w-[150px]" />
						<Skeleton className="h-6 w-[150px]" />
						<Skeleton className="h-6 w-[100px]" />
						<Skeleton className="h-6 w-[80px]" />
					</div>
					{/* Rows */}
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

			{/* Pagination skeleton */}
			<div className="flex items-center justify-end space-x-2 py-4">
				<Skeleton className="h-8 w-[100px]" />
				<Skeleton className="h-8 w-[80px]" />
				<Skeleton className="h-8 w-[80px]" />
			</div>
		</div>
	)
}

/**
 * Default loading component for the page
 */
export default function Loading() {
	return <FormulariTableSkeleton />
}