"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FormularioUI } from "@/types/database.types"

/**
 * Badge component to display status with appropriate colors
 */
const StatusBadge = ({ status }: { status: FormularioUI["stato"] }) => {
	const statusStyles = {
		in_attesa: "bg-yellow-100 text-yellow-800",
		approvato: "bg-green-100 text-green-800",
		rifiutato: "bg-red-100 text-red-800",
		completato: "bg-blue-100 text-blue-800",
	}

	const statusLabels = {
		in_attesa: "In attesa",
		approvato: "Approvato",
		rifiutato: "Rifiutato",
		completato: "Completato",
	}

	return (
		<span
			className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
		>
			{statusLabels[status]}
		</span>
	)
}

/**
 * Column definitions for the Formulario data table
 */
export const columns: ColumnDef<FormularioUI>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "codice",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Codice
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => <div>{row.getValue("codice")}</div>,
	},
	{
		accessorKey: "data",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Data
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			// Format date for display
			const date = new Date(row.getValue("data"))
			return <div>{date.toLocaleDateString("it-IT")}</div>
		},
	},
	{
		accessorKey: "produttore",
		header: "Produttore",
		cell: ({ row }) => <div>{row.getValue("produttore")}</div>,
	},
	{
		accessorKey: "trasportatore",
		header: "Trasportatore",
		cell: ({ row }) => <div>{row.getValue("trasportatore")}</div>,
	},
	{
		accessorKey: "destinazione",
		header: "Destinazione",
		cell: ({ row }) => <div>{row.getValue("destinazione")}</div>,
	},
	{
		accessorKey: "quantita",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Quantità (kg)
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("quantita"))
			return <div className="text-right font-medium">{amount.toLocaleString("it-IT")}</div>
		},
	},
	{
		accessorKey: "stato",
		header: "Stato",
		cell: ({ row }) => {
			return <StatusBadge status={row.getValue("stato")} />
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const formulario = row.original

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Apri menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Azioni</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(formulario.id)}
						>
							Copia ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Visualizza dettagli</DropdownMenuItem>
						<DropdownMenuItem>Modifica</DropdownMenuItem>
						<DropdownMenuItem className="text-red-600">Elimina</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]