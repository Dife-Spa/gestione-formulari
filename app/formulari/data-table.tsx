"use client"

import * as React from "react"
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	// Remove getFilteredRowModel since we're doing server-side filtering
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

/**
 * Props for the DataTable component
 */
interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	totalItems: number
	totalPages: number
	currentPage: number
	pageSize: number
}

/**
 * A reusable data table component with sorting, filtering, pagination, and column visibility
 * that uses URL-based pagination for server-side data fetching
 */
export function DataTable<TData, TValue>({
	columns,
	data,
	totalItems,
	totalPages,
	currentPage,
	pageSize,
}: DataTableProps<TData, TValue>) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = React.useState({})

	// Get current search value from URL params
	const currentSearch = searchParams?.get('search') || ''

	// Create URL search params for navigation
	const createQueryString = React.useCallback(
		(params: Record<string, string | number | null>) => {
			const newSearchParams = new URLSearchParams(searchParams?.toString())
			
			Object.entries(params).forEach(([key, value]) => {
				if (value === null) {
					newSearchParams.delete(key)
				} else {
					newSearchParams.set(key, String(value))
				}
			})
			
			return newSearchParams.toString()
		},
		[searchParams]
	)

	// Handle page navigation
	const goToPage = (page: number) => {
		router.push(`?${createQueryString({ page })}`)
	}

	// Handle search with debouncing
	const [searchValue, setSearchValue] = React.useState(currentSearch)
	const [debouncedSearch, setDebouncedSearch] = React.useState(currentSearch)

	// Debounce search input
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchValue)
		}, 300)

		return () => clearTimeout(timer)
	}, [searchValue])

	// Navigate when debounced search changes
	React.useEffect(() => {
		if (debouncedSearch !== currentSearch) {
			if (debouncedSearch) {
				router.push(`?${createQueryString({ search: debouncedSearch, page: 1 })}`)
			} else {
				router.push(`?${createQueryString({ search: null, page: 1 })}`)
			}
		}
	}, [debouncedSearch, currentSearch, router, createQueryString])

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		// Remove getFilteredRowModel since we're doing server-side filtering
		getSortedRowModel: getSortedRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
		},
		// Remove client-side pagination since we're doing server-side pagination
		manualPagination: true,
		manualFiltering: true,
		pageCount: totalPages,
	})

	return (
		<div className="w-full">
			<div className="flex items-center py-4">
				<Input
					placeholder="Filtra per codice..."
					value={searchValue}
					onChange={(event) => setSearchValue(event.target.value)}
					className="max-w-sm"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Colonne <ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								)
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									Nessun risultato.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="text-sm text-muted-foreground">
					Mostrando {data.length} di {totalItems} risultati
				</div>
				<div className="flex items-center space-x-6">
					<div className="text-sm text-muted-foreground">
						Pagina {currentPage} di {totalPages}
					</div>
					<div className="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => goToPage(currentPage - 1)}
							disabled={currentPage <= 1}
						>
							Precedente
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => goToPage(currentPage + 1)}
							disabled={currentPage >= totalPages}
						>
							Successiva
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}