"use client"

import * as React from "react"
import { Check, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface DocumentsFilterProps {
	onChange: (selectedDocuments: string[]) => void
	selectedDocuments?: string[]
}

/**
 * Dropdown filter component for document types
 * Allows users to filter by document types: Originale, Formulario, Buono intervento, Scontrino
 */
export function DocumentsFilter({ onChange, selectedDocuments = [] }: DocumentsFilterProps) {
	const documentTypes = [
		{ id: "file_input", label: "Originale" },
		{ id: "formulario", label: "Formulario" },
		{ id: "buono_intervento", label: "Buono intervento" },
		{ id: "scontrino", label: "Scontrino" },
	]

	// Handle checkbox toggle
	const handleCheckboxChange = (documentId: string) => {
		let newSelectedDocuments: string[]

		if (selectedDocuments.includes(documentId)) {
			// Remove if already selected
			newSelectedDocuments = selectedDocuments.filter(id => id !== documentId)
		} else {
			// Add if not selected
			newSelectedDocuments = [...selectedDocuments, documentId]
		}

		onChange(newSelectedDocuments)
	}

	// Count selected documents for badge display
	const selectedCount = selectedDocuments.length

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className={`w-[220px] justify-start text-left font-normal ${selectedCount === 0 ? "text-muted-foreground" : ""}`}
				>
					<FileIcon className="h-4 w-4" />
					{selectedCount > 0 ? (
						<>
							Documenti
							<Badge 
								variant="secondary" 
								className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
							>
								{selectedCount}
							</Badge>
						</>
					) : (
						<span>Filtra per documenti</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-[220px]">
				{/* <DropdownMenuLabel>Tipo documento</DropdownMenuLabel> */}
				{/* <DropdownMenuSeparator /> */}
				{documentTypes.map((document) => (
					<DropdownMenuCheckboxItem
						key={document.id}
						checked={selectedDocuments.includes(document.id)}
						onCheckedChange={() => handleCheckboxChange(document.id)}
					>
						{document.label}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}