"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DaGestireFilterProps {
	onChange: (daGestireStatus: string) => void
	selectedDaGestireStatus?: string
}

/**
 * Tab-style filter component for "Da gestire" status
 * Allows users to filter by items that need to be managed: "Tutti" or "Da gestire"
 */
export function DaGestireFilter({ onChange, selectedDaGestireStatus = "" }: DaGestireFilterProps) {
	const daGestireOptions = [
		{ value: "", label: "Tutto" },
		{ value: "da_gestire", label: "Da gestire" },
	]

	// Handle tab selection change
	const handleValueChange = (value: string) => {
		onChange(value)
	}

	return (
		<div className="flex space-x-1 items-center rounded-lg bg-muted border py-1 pl-3 pr-1">
            <span className="text-xs uppercase mr-3">Mostra</span>
			{daGestireOptions.map((option) => (
				<button
					key={option.value}
					onClick={() => handleValueChange(option.value)}
					className={cn(
						"px-3 py-1 text-xs font-medium rounded-md transition-colors",
						option.value === selectedDaGestireStatus
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