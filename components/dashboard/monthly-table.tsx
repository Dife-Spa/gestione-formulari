"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { ChevronDown, FileX } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MonthlyFormulario = {
  id: number;
  numeroFir: string | null;
  data_movimento: string | null;
  data_emissione: string | null;
  id_appuntamento: string | null;
  produttore: string | null;
  destinatario: string | null;
  stato: string;
};

/**
 * MonthlyTable component for displaying formulari data for a selected month
 */
export function MonthlyTable() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [monthlyFormulari, setMonthlyFormulari] = useState<MonthlyFormulario[]>(
    []
  );
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonthlyFormulari();
  }, [selectedMonth]);

  /**
   * Fetches formulari data for the selected month
   */
  async function fetchMonthlyFormulari() {
    try {
      setIsLoadingMonthly(true);
      setError(null);

      // Get selected month date range
      const firstDayOfMonth = startOfMonth(selectedMonth).toISOString();
      const lastDayOfMonth = endOfMonth(selectedMonth).toISOString();

      // Fetch formulari with data_movimento in selected month
      const { data, error } = await supabase
        .from("formulari")
        .select(
          "id, numeroFir, data_movimento, produttore, destinatario, data_emissione, risultati_invio_pec, id_appuntamento"
        )
        .gte("data_movimento", firstDayOfMonth)
        .lte("data_movimento", lastDayOfMonth)
        .order("data_movimento", { ascending: false });

      if (error) throw error;

      // Transform data for display
      const transformedData = data.map((item) => {
        // Determine status based on available data
        let stato = "In attesa";
        if (item.risultati_invio_pec) {
          stato = "Completato";
        } else if (item.data_movimento) {
          stato = "Approvato";
        }

        return {
          id: item.id,
          numeroFir: item.numeroFir || `FIR-${item.id}`,
          data_movimento: item.data_movimento,
          data_emissione: item.data_emissione,
          id_appuntamento: item.id_appuntamento,
          produttore: item.produttore || "N/A",
          destinatario: item.destinatario || "N/A",
          stato,
        };
      });

      setMonthlyFormulari(transformedData);
    } catch (error) {
      console.error("Error fetching monthly formulari:", error);
      setError("Impossibile caricare i formulari del mese selezionato");
    } finally {
      setIsLoadingMonthly(false);
    }
  }

  const formattedMonth = format(selectedMonth, "MMMM yyyy", { locale: it });

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col h-[calc(100vh-24rem)]">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">Formulari di</h2>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-lg font-medium text-muted-foreground hover:text-foreground cursor-pointer">
              <span>{formattedMonth}</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(i);
                date.setDate(1);
                return (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => {
                      const newDate = new Date(selectedMonth);
                      newDate.setMonth(i);
                      setSelectedMonth(newDate);
                    }}
                    className={selectedMonth.getMonth() === i ? "bg-muted" : ""}
                  >
                    {format(date, "MMMM yyyy", { locale: it })}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <Table>
          <TableCaption>
            {isLoadingMonthly
              ? "Caricamento..."
              : error
              ? error
              : monthlyFormulari.length === 0
              ? `Nessun formulario trovato per ${formattedMonth}`
              : `Mostra ${monthlyFormulari.length} formulari di ${formattedMonth}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>N° formulario</TableHead>
              <TableHead>ID appuntamento</TableHead>
              <TableHead>Data emissione</TableHead>
              <TableHead>Data movimento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingMonthly ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Caricamento...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : monthlyFormulari.length === 0 ? (
              <TableRow className="h-full">
                <TableCell
                  colSpan={4}
                  className="text-center h-[calc(100vh-30rem)] align-middle"
                >
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FileX className="h-12 w-12 mb-2 text-muted" />
                    <p>Nessun formulario trovato per {formattedMonth}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              monthlyFormulari.map((formulario) => (
                <TableRow key={formulario.id}>
                  <TableCell className="font-medium">
                    {formulario.numeroFir}
                  </TableCell>
                  <TableCell>{formulario.id_appuntamento || "N/A"}</TableCell>
                  <TableCell>
                    {formulario.data_emissione
                      ? format(
                          new Date(formulario.data_emissione),
                          "dd/MM/yyyy"
                        )
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {formulario.data_movimento
                      ? format(
                          new Date(formulario.data_movimento),
                          "dd/MM/yyyy"
                        )
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
