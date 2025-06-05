"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

type EntityType = 'produttore' | 'trasportatore' | 'destinatario' | 'intermediario'

type EntityOption = {
  value: EntityType
  label: string
  pluralLabel: string
}

type TopEntity = {
  entity: string
  count: number
}

const entityOptions: EntityOption[] = [
  { value: 'produttore', label: 'Produttori', pluralLabel: 'produttori' },
  { value: 'trasportatore', label: 'Trasportatori', pluralLabel: 'trasportatori' },
  { value: 'destinatario', label: 'Destinatari', pluralLabel: 'destinatari' },
  { value: 'intermediario', label: 'Intermediari', pluralLabel: 'intermediari' },
]

/**
 * TopProduttoriTable component for displaying the top 15 entities by frequency
 */
export function TopProduttoriTable() {
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('produttore')
  const [topEntities, setTopEntities] = useState<TopEntity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentOption = entityOptions.find(option => option.value === selectedEntityType)!

  useEffect(() => {
    fetchTopEntities()
  }, [selectedEntityType])

  /**
   * Fetches the top 15 entities by count from the formulari table
   */
  async function fetchTopEntities() {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch all formulari with the selected entity field
      const { data, error } = await supabase
        .from('formulari')
        .select(selectedEntityType)
        .not(selectedEntityType, 'is', null)
        .not(selectedEntityType, 'eq', '')
      
      if (error) throw error
      
      // Count occurrences of each entity
      const entityCount: { [key: string]: number } = {}
      data.forEach((item: any) => {
        const entityValue = item[selectedEntityType]
        entityCount[entityValue] = (entityCount[entityValue] || 0) + 1
      })
      
      // Convert to array and sort by count
      const sortedEntities = Object.entries(entityCount)
        .map(([entity, count]) => ({ entity, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
      
      setTopEntities(sortedEntities)
    } catch (error) {
      console.error(`Error fetching top ${selectedEntityType}:`, error)
      setError(`Impossibile caricare i ${currentOption.pluralLabel} più frequenti`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles entity type selection change
   */
  function handleEntityTypeChange(entityType: EntityType) {
    setSelectedEntityType(entityType)
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm p-4 flex flex-col h-[calc(100vh-24rem)]">
      <div className="mb-4 flex items-center gap-4">
        <h2 className="text-xl font-semibold">Top 15</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[140px] justify-between">
              {currentOption.label}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {entityOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleEntityTypeChange(option.value)}
                className={selectedEntityType === option.value ? "bg-accent" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="overflow-auto flex-1">
        <Table>
          <TableCaption>
            {isLoading ? 'Caricamento...' : 
             error ? error : 
             topEntities.length === 0 ? `Nessun ${currentOption.pluralLabel.slice(0, -1)} trovato` : 
             `I 15 ${currentOption.pluralLabel} più frequenti`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{currentOption.label}</TableHead>
              <TableHead className="text-right">Numero Formulari</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">Caricamento...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-red-500">{error}</TableCell>
              </TableRow>
            ) : topEntities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">Nessun {currentOption.pluralLabel.slice(0, -1)} trovato</TableCell>
              </TableRow>
            ) : (
              topEntities.map((item: TopEntity, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.entity}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}