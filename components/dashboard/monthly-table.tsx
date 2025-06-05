"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { it } from "date-fns/locale"
import { ChevronDown } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type MonthlyFormulario = {
  id: number
  numeroFir: string | null
  data_movimento: string | null
  produttore: string | null
  destinatario: string | null
  stato: string
}

/**
 * MonthlyTable component for displaying formulari data for a selected month
 */
export function MonthlyTable() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [monthlyFormulari, setMonthlyFormulari] = useState<MonthlyFormulario[]>([])
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMonthlyFormulari()
  }, [selectedMonth])

  /**
   * Fetches formulari data for the selected month
   */
  async function fetchMonthlyFormulari() {
    try {
      setIsLoadingMonthly(true)
      setError(null)
      
      // Get selected month date range
      const firstDayOfMonth = startOfMonth(selectedMonth).toISOString()
      const lastDayOfMonth = endOfMonth(selectedMonth).toISOString()
      
      // Fetch formulari with data_movimento in selected month
      const { data, error } = await supabase
        .from('formulari')
        .select('id, numeroFir, data_movimento, produttore, destinatario, data_emissione, risultati_invio_pec')
        .gte('data_movimento', firstDayOfMonth)
        .lte('data_movimento', lastDayOfMonth)
        .order('data_movimento', { ascending: false })
      
      if (error) throw error
      
      // Transform data for display
      const transformedData = data.map(item => {
        // Determine status based on available data
        let stato = 'In attesa'
        if (item.risultati_invio_pec) {
          stato = 'Completato'
        } else if (item.data_movimento) {
          stato = 'Approvato'
        }
        
        return {
          id: item.id,
          numeroFir: item.numeroFir || `FIR-${item.id}`,
          data_movimento: item.data_movimento,
          produttore: item.produttore || 'N/A',
          destinatario: item.destinatario || 'N/A',
          stato
        }
      })
      
      setMonthlyFormulari(transformedData)
    } catch (error) {
      console.error('Error fetching monthly formulari:', error)
      setError('Impossibile caricare i formulari del mese selezionato')
    } finally {
      setIsLoadingMonthly(false)
    }
  }

  const formattedMonth = format(selectedMonth, 'MMMM yyyy', { locale: it })

  return (
    <div className="bg-card rounded-xl border shadow-sm p-4 flex flex-col h-[calc(100vh-24rem)]">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">Formulari di</h2>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                {formattedMonth}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[200px]">
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date()
                date.setMonth(i)
                date.setDate(1)
                return (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => {
                      const newDate = new Date(selectedMonth)
                      newDate.setMonth(i)
                      setSelectedMonth(newDate)
                    }}
                    className={selectedMonth.getMonth() === i ? "bg-accent" : ""}
                  >
                    {format(date, 'MMMM yyyy', { locale: it })}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="overflow-auto flex-1">
        <Table>
          <TableCaption>
            {isLoadingMonthly ? 'Caricamento...' : 
             error ? error : 
             monthlyFormulari.length === 0 ? `Nessun formulario trovato per ${formattedMonth}` : 
             `Mostra ${monthlyFormulari.length} formulari di ${formattedMonth}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Codice</TableHead>
              <TableHead>Data movimento</TableHead>
              <TableHead>Produttore</TableHead>
              <TableHead>Destinatario</TableHead>
              <TableHead>Stato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingMonthly ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Caricamento...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500">{error}</TableCell>
              </TableRow>
            ) : monthlyFormulari.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Nessun formulario trovato per {formattedMonth}</TableCell>
              </TableRow>
            ) : (
              monthlyFormulari.map((formulario) => (
                <TableRow key={formulario.id}>
                  <TableCell className="font-medium">{formulario.numeroFir}</TableCell>
                  <TableCell>
                    {formulario.data_movimento ? 
                      format(new Date(formulario.data_movimento), 'dd/MM/yyyy') : 
                      'N/A'}
                  </TableCell>
                  <TableCell>{formulario.produttore}</TableCell>
                  <TableCell>{formulario.destinatario}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      formulario.stato === 'Completato' ? 'bg-blue-100 text-blue-800' :
                      formulario.stato === 'Approvato' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formulario.stato}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}