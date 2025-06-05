"use client"

import * as React from "react"
import { Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FileUploadProps extends Omit<React.ComponentProps<"input">, "type"> {
	className?: string
	onFileSelect?: (file: File | null) => void
	placeholder?: string
}

/**
 * Custom file upload component with drag and drop functionality
 * @param className - Additional CSS classes
 * @param onFileSelect - Callback when file is selected
 * @param placeholder - Placeholder text
 * @param props - Additional input props
 */
function FileUpload({
	className,
	onFileSelect,
	placeholder = "Clicca per selezionare un file dal computer",
	...props
}: FileUploadProps) {
	const [isDragOver, setIsDragOver] = React.useState(false)
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
	const fileInputRef = React.useRef<HTMLInputElement>(null)

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null
		setSelectedFile(file)
		onFileSelect?.(file)
	}

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault()
		setIsDragOver(true)
	}

	const handleDragLeave = (event: React.DragEvent) => {
		event.preventDefault()
		setIsDragOver(false)
	}

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault()
		setIsDragOver(false)
		
		const files = event.dataTransfer.files
		if (files.length > 0) {
			const file = files[0]
			setSelectedFile(file)
			onFileSelect?.(file)
			
			// Update the file input
			if (fileInputRef.current) {
				const dataTransfer = new DataTransfer()
				dataTransfer.items.add(file)
				fileInputRef.current.files = dataTransfer.files
			}
		}
	}

	const handleClick = () => {
		fileInputRef.current?.click()
	}

	return (
		<div className="w-full">
			{/* Hidden file input */}
			<Input
				ref={fileInputRef}
				type="file"
				className="hidden"
				onChange={handleFileChange}
				{...props}
			/>
			
			{/* Custom upload area */}
			<div
				onClick={handleClick}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					"flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
					"hover:bg-muted/50 hover:border-primary/50",
					isDragOver
						? "border-primary bg-primary/5"
						: "border-muted-foreground/25 bg-background",
					className
				)}
			>
				<div className="flex flex-col items-center justify-center pt-5 pb-6">
					<Upload className="w-10 h-10 mb-3 text-muted-foreground" />
					<p className="mb-2 text-sm text-muted-foreground">
						<span className="font-semibold">
							{selectedFile ? selectedFile.name : "Clicca per caricare un file"}
						</span>
						{!selectedFile && " o trascinalo qui"}
					</p>
					{!selectedFile && (
						<p className="text-xs text-muted-foreground">
							{placeholder}
						</p>
					)}
					{selectedFile && (
						<p className="text-xs text-muted-foreground">
							Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
						</p>
					)}
				</div>
			</div>
		</div>
	)
}

export { FileUpload, type FileUploadProps }