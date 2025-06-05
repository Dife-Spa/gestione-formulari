"use client"

import * as React from "react"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface PecFilterProps {
	onChange: (pecStatus: string) => void
	selectedPecStatus?: string
}

/**
 * Dropdown filter component for PEC status
 * Allows users to filter by PEC sent status: "PEC inviata" or "PEC non inviata"
 */
export function PecFilter({ onChange, selectedPecStatus = "" }: PecFilterProps) {
	const pecOptions = [
		{ value: "", label: "Tutti" },
		{ value: "inviata", label: "PEC inviata" },
		{ value: "non_inviata", label: "PEC non inviata" },
	]

	// Handle radio selection change
	const handleValueChange = (value: string) => {
		onChange(value)
	}

	// Get display label for selected option
	const getDisplayLabel = () => {
		const selectedOption = pecOptions.find(option => option.value === selectedPecStatus)
		return selectedOption ? selectedOption.label : "Filtra per invio PEC"
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className={`w-[180px] justify-start text-left font-normal ${
						selectedPecStatus === "" ? "text-muted-foreground" : ""
					}`}
				>
					<Mail className="h-4 w-4" />
					{selectedPecStatus !== "" ? (
						<>
							{getDisplayLabel()}
							<Badge 
								variant="secondary" 
								className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
							>
								1
							</Badge>
						</>
					) : (
						<span>Filtra per invio PEC</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-[180px]">
				{/* <DropdownMenuLabel>Stato PEC</DropdownMenuLabel>
				<DropdownMenuSeparator /> */}
				<DropdownMenuRadioGroup value={selectedPecStatus} onValueChange={handleValueChange}>
					{pecOptions.map((option) => (
						<DropdownMenuRadioItem key={option.value} value={option.value}>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}