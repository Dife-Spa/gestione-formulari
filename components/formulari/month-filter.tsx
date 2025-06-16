"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface MonthFilterProps {
	onChange: (month: string) => void
	selectedMonth?: string
}

/**
 * Month filter component for filtering by month
 * Allows users to filter by "Tutti" or specific months of the current year
 */
export function MonthFilter({ onChange, selectedMonth = "" }: MonthFilterProps) {
	// Get current year
	const currentYear = new Date().getFullYear()
	
	// Create month options
	const monthOptions = [
		{ value: "", label: "Tutto" },
		{ value: `${currentYear}-01`, label: "Gennaio" },
		{ value: `${currentYear}-02`, label: "Febbraio" },
		{ value: `${currentYear}-03`, label: "Marzo" },
		{ value: `${currentYear}-04`, label: "Aprile" },
		{ value: `${currentYear}-05`, label: "Maggio" },
		{ value: `${currentYear}-06`, label: "Giugno" },
		{ value: `${currentYear}-07`, label: "Luglio" },
		{ value: `${currentYear}-08`, label: "Agosto" },
		{ value: `${currentYear}-09`, label: "Settembre" },
		{ value: `${currentYear}-10`, label: "Ottobre" },
		{ value: `${currentYear}-11`, label: "Novembre" },
		{ value: `${currentYear}-12`, label: "Dicembre" },
	]

	// Handle tab selection change
	const handleValueChange = (value: string) => {
		onChange(value)
	}

	// Get the selected month label
	const getSelectedMonthLabel = () => {
		const selected = monthOptions.find(option => option.value === selectedMonth)
		return selected ? selected.label : "Tutti i mesi"
	}

	return (
		<div className="flex space-x-1 items-center rounded-lg bg-muted border py-1 pl-3 pr-1">
			<span className="text-xs uppercase mr-3">Mese</span>
			<Button
				variant="ghost"
				size="sm" // Change to sm size
				className={cn(
					"h-auto px-3 py-1 text-xs font-medium rounded-md transition-colors", // Override with h-auto
					selectedMonth === ""
						? "bg-blue-200 text-primary shadow-sm"
						: "text-muted-foreground hover:text-primary hover:bg-muted"
				)}
				onClick={() => handleValueChange("")}
			>
				Tutti
			</Button>
			
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm" // Change to sm size which has less padding
						className={cn(
							"h-auto px-3 py-1 text-xs font-medium rounded-md transition-colors", // Override with h-auto
							selectedMonth !== ""
								? "bg-blue-200 text-primary shadow-sm"
							: "text-muted-foreground hover:text-primary hover:bg-muted"
						)}
					>
						{selectedMonth !== "" ? getSelectedMonthLabel() : "Seleziona mese"}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-[180px]">
					<DropdownMenuRadioGroup
						value={selectedMonth}
						onValueChange={handleValueChange}
					>
						{monthOptions.slice(1).map((option) => (
							<DropdownMenuRadioItem key={option.value} value={option.value}>
								{option.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}