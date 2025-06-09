"use client";

import { ColumnDef, TableMeta } from "@tanstack/react-table";
// Update the imports at the top to include Tooltip components
import {
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  Ban,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { FormularioUI } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

/**
 * Badge component to display status with appropriate colors
 */
const StatusBadge = ({ status }: { status: FormularioUI["stato"] }) => {
  const statusStyles = {
    in_attesa: "bg-yellow-100 text-yellow-800",
    approvato: "bg-green-100 text-green-800",
    rifiutato: "bg-red-100 text-red-800",
    completato: "bg-blue-100 text-blue-800",
  };

  const statusLabels = {
    in_attesa: "In attesa",
    approvato: "Approvato",
    rifiutato: "Rifiutato",
    completato: "Completato",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
};

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
  // Update the codice column definition
  {
    accessorKey: "codice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          N° formulario
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }) => (
      <button
        className="font-medium text-left hover:underline focus:outline-none"
        onClick={() => {
          // Get the handleFormularioSelect function from the table meta
          const { handleFormularioSelect } = table.options.meta || {};
          if (handleFormularioSelect) {
            handleFormularioSelect(row.original);
          }
        }}
      >
        <div className="flex items-center min-w-[140px]">
          {row.original.id_appuntamento ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Calendar
                  className="mr-2 h-4 w-4 text-blue-500 cursor-help"
                  aria-hidden="true"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>ID Appuntamento: {row.original.id_appuntamento}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Calendar
              className="mr-2 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
          )}
          {row.getValue("codice")}
        </div>
      </button>
    ),
  },
  {
    accessorKey: "data",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data emissione
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // Format date for display
      const date = new Date(row.getValue("data"));
      return (
        <div className="w-[120px]">{date.toLocaleDateString("it-IT")}</div>
      );
    },
  },
  // Example of updating the produttore column with Tooltip
  {
    accessorKey: "produttore",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produttore
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("produttore") as string;
      return (
        <div className="w-[180px] truncate">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">{value}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{value}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  // Example of updating the trasportatore column with Tooltip
  {
    accessorKey: "trasportatore",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Trasportatore
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("trasportatore") as string;
      return (
        <div className="w-[180px] truncate">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">{value}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{value}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  // Example of updating the destinatario column with Tooltip
  {
    accessorKey: "destinatario",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Destinatario
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("destinatario") as string;
      return (
        <div className="max-w-[180px] truncate">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">{value}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{value}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  // Example of updating the intermediario column with Tooltip
  {
    accessorKey: "intermediario",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Intermediario
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("intermediario") as string | null;
      if (value && value !== "non presente") {
        return (
          <div className="max-w-[180px] truncate">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">{value}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{value}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      } else {
        return <div className="text-muted-foreground">-</div>;
      }
    },
  },
  {
    id: "documenti",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Documenti
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const file_paths = row.original.file_paths;

      // If no file paths, show a message
      if (!file_paths) {
        return (
          <div className="flex justify-center text-gray-400 w-[150px]">
            <Ban className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Nessun documento</span>
          </div>
        );
      }

      // Badge colors for different document types
      const badgeStyles = {
        scontrino: "bg-purple-500 text-white",
        file_input: "bg-blue-500 text-white",
        formulario: "bg-green-500 text-white",
        buono_intervento: "bg-amber-500 text-white",
      };

      // Document type letters
      const documentLetters = {
        file_input: "O",
        formulario: "F",
        buono_intervento: "B",
        scontrino: "S",
      };

      // Specific ordering of badges
      const badgeOrder = [
        "file_input",
        "formulario",
        "buono_intervento",
        "scontrino",
      ];

      return (
        <div className="flex flex-row flex-nowrap gap-1 w-[150px]">
          {badgeOrder.map((key) => {
            // Check if the file exists
            const hasFile = file_paths[key as keyof typeof file_paths] != null;
            const fileUrl = hasFile
              ? file_paths[key as keyof typeof file_paths]
              : null;

            // For non-clickable badges (no file)
            if (!hasFile) {
              return (
                <Badge
                  key={key}
                  className="bg-gray-100 text-gray-400"
                  variant="outline"
                >
                  {documentLetters[key as keyof typeof documentLetters]}
                </Badge>
              );
            }

            // For clickable badges (has file)
            return (
              <a
                key={key}
                href={fileUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => !fileUrl && e.preventDefault()}
              >
                <Badge
                  className={`${
                    badgeStyles[key as keyof typeof badgeStyles]
                  } cursor-pointer hover:opacity-80`}
                  variant="outline"
                >
                  {documentLetters[key as keyof typeof documentLetters]}
                </Badge>
              </a>
            );
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const formulario = row.original;
      const meta = table.options.meta as TableMeta<FormularioUI>;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Apri menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Copia</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(formulario.codice || "");
                    toast.success("N° formulario copiato negli appunti");
                  }}
                  disabled={!formulario.codice}
                >
                  N° formulario
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(
                      formulario.id_appuntamento?.toString() || ""
                    );
                    toast.success("ID appuntamento copiato negli appunti");
                  }}
                  disabled={!formulario.id_appuntamento}
                >
                  ID appuntamento
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(formulario.produttore || "");
                    toast.success("Produttore copiato negli appunti");
                  }}
                  disabled={
                    !formulario.produttore ||
                    formulario.produttore === "non presente"
                  }
                >
                  Produttore
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(
                      formulario.destinatario || ""
                    );
                    toast.success("Destinatario copiato negli appunti");
                  }}
                  disabled={
                    !formulario.destinatario ||
                    formulario.destinatario === "non presente"
                  }
                >
                  Destinatario
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(
                      formulario.trasportatore || ""
                    );
                    toast.success("Trasportatore copiato negli appunti");
                  }}
                  disabled={
                    !formulario.trasportatore ||
                    formulario.trasportatore === "non presente"
                  }
                >
                  Trasportatore
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(
                      formulario.intermediario || ""
                    );
                    toast.success("Intermediario copiato negli appunti");
                  }}
                  disabled={
                    !formulario.intermediario ||
                    formulario.intermediario === "non presente"
                  }
                >
                  Intermediario
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta?.handleFormularioSelect?.(formulario)}
            >
              Visualizza
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  if (!formulario?.uid) {
                    toast.error("UID del formulario non disponibile");
                    return;
                  }

                  const response = await fetch("/api/send-pec", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      uid_array: [formulario.uid],
                    }),
                  });

                  if (!response.ok) {
                    throw new Error(`Errore HTTP: ${response.status}`);
                  }

                  const result = await response.json();
                  console.log("PEC inviata con successo:", result);
                  toast.success("PEC inviata con successo");
                } catch (error) {
                  console.error("Errore durante l'invio della PEC:", error);
                  toast.error("Errore durante l'invio della PEC");
                }
              }}
            >
              Invia PEC
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={async () => {
                try {
                  // Get the formulario ID
                  const formularioId = formulario?.id;
                  if (!formularioId) {
                    console.error("No formulario ID available");
                    toast.error("ID formulario non disponibile");
                    return;
                  }

                  // Use the uid directly from the formulario object
                  const uid = formulario.uid;
                  if (!uid) {
                    console.error(
                      "No UID available for formulario:",
                      formularioId
                    );
                    toast.error("UID formulario non disponibile");
                    return;
                  }

                  // Make the API call to delete the formulario
                  const response = await fetch("/api/delete-formulario", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      uid_array: [uid],
                    }),
                  });

                  if (!response.ok) {
                    throw new Error(
                      `API call failed with status: ${response.status}`
                    );
                  }

                  console.log("Formulario deleted successfully:", formularioId);

                  // Refresh the data table using the meta function
                  if (meta?.handleRefreshData) {
                    meta.handleRefreshData();
                  }

                  // Show a success toast notification
                  toast.success("Formulario eliminato con successo");
                } catch (error) {
                  console.error("Error deleting formulario:", error);
                  // Show an error toast notification
                  toast.error("Errore durante l'eliminazione del formulario");
                }
              }}
            >
              Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
