"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PecFilterProps {
	onChange: (pecStatus: string) => void
	selectedPecStatus?: string
}

/**
 * Tab-style filter component for PEC status
 * Allows users to filter by PEC sent status: "Tutti", "PEC inviata" or "PEC non inviata"
 */
export function PecFilter({ onChange, selectedPecStatus = "" }: PecFilterProps) {
	const pecOptions = [
		{ value: "", label: "Tutto" },
		{ value: "inviata", label: "Inviata" },
		{ value: "non_inviata", label: "Non inviata" },
	]

	// Handle tab selection change
	const handleValueChange = (value: string) => {
		onChange(value)
	}

	return (
		<div className="flex space-x-1 items-center rounded-lg bg-muted border py-1 pl-3 pr-1">
			<span className="text-xs uppercase mr-3">Stato PEC</span>
			{pecOptions.map((option) => (
				<button
					key={option.value}
					onClick={() => handleValueChange(option.value)}
					className={cn(
						"px-3 py-1 text-xs font-medium rounded-md transition-colors",
						option.value === selectedPecStatus
							? "bg-blue-200 text-primary shadow-sm"
							: "text-muted-foreground hover:text-primary hover:bg-muted"
					)}
				>
					{option.label}
				</button>
			))}
		</div>
	)
}