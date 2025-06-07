"use client";

// Update imports to include DocumentsFilter
import * as React from "react";
import { format, isValid } from "date-fns";
import { it } from "date-fns/locale";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
// Update the imports at the top of the file to include the new icons
import { CalendarIcon, Search, ChevronDown, Trash2, Mail } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Remove TooltipProvider from imports
import { TooltipProvider } from "@/components/ui/tooltip";
// Import the FormularioDetails component
import { FormularioDetails } from "@/components/formulari/formulario-details";
import { FormularioUI } from "@/types/database.types";
// Import the DocumentsFilter component
import { DocumentsFilter } from "@/components/formulari/documents-filter";
// Add import for PecFilter
import { PecFilter } from "@/components/formulari/pec-filter";

/**
 * Interface for the DateRange type
 */
interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

/**
 * Props for the DataTable component
 */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * A reusable data table component with sorting, filtering, pagination, and column visibility
 * that uses URL-based pagination for server-side data fetching
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  totalPages,
  currentPage,
  pageSize,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Add state for the drawer
  const [selectedFormulario, setSelectedFormulario] =
    React.useState<FormularioUI | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Function to handle formulario selection
  const handleFormularioSelect = (formulario: FormularioUI) => {
    setSelectedFormulario(formulario);
    setDrawerOpen(true);
  };

  // Function to refresh data after deletion
  const handleRefreshData = React.useCallback(() => {
    router.refresh();
  }, [router]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Get current search value from URL params
  const currentSearch = searchParams?.get("search") || "";

  // Get current date filter values from URL params
  const currentDateFrom = searchParams?.get("dateFrom") || "";
  const currentDateTo = searchParams?.get("dateTo") || "";

  // Get current documents filter values from URL params
  const currentDocuments = searchParams?.get("documents") || "";

  // Initialize date range state
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: currentDateFrom ? new Date(currentDateFrom) : undefined,
    to: currentDateTo ? new Date(currentDateTo) : undefined,
  });

  // Initialize selected documents state
  const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>(
    currentDocuments ? currentDocuments.split(",") : []
  );

  // Create URL search params for navigation
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  // Handle page navigation
  const goToPage = (page: number) => {
    router.push(`?${createQueryString({ page })}`);
  };

  // Handle search with debouncing
  const [searchValue, setSearchValue] = React.useState(currentSearch);
  const [debouncedSearch, setDebouncedSearch] = React.useState(currentSearch);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    if (range.from) {
      const params: Record<string, string | number | null> = {
        page: 1,
        dateFrom: range.from.toISOString().split("T")[0],
      };
      if (range.to) {
        params.dateTo = range.to.toISOString().split("T")[0];
      } else {
        params.dateTo = null;
      }
      router.push(`?${createQueryString(params)}`);
    }
  };

  // Clear date range
  const handleClearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
    router.push(
      `?${createQueryString({ dateFrom: null, dateTo: null, page: 1 })}`
    );
  };

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Navigate when debounced search changes
  React.useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) {
        router.push(
          `?${createQueryString({ search: debouncedSearch, page: 1 })}`
        );
      } else {
        router.push(`?${createQueryString({ search: null, page: 1 })}`);
      }
    }
  }, [debouncedSearch, currentSearch, router, createQueryString]);

  // Inside the DataTable component

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    manualFiltering: true,
    pageCount: totalPages,
    // Add meta to pass the handler to the cell renderer
    meta: {
      handleFormularioSelect: (formulario: FormularioUI) =>
        handleFormularioSelect(formulario),
      handleRefreshData: () => handleRefreshData(),
    },
  });

  // Handle documents filter change
  const handleDocumentsChange = (documents: string[]) => {
    setSelectedDocuments(documents);
    const params: Record<string, string | number | null> = {
      page: 1,
      documents: documents.length > 0 ? documents.join(",") : null,
    };
    router.push(`?${createQueryString(params)}`);
  };

  // In the DataTable component, add state for PEC filter
  const currentPecStatus = searchParams?.get("pecStatus") || "";
  const [selectedPecStatus, setSelectedPecStatus] =
    React.useState<string>(currentPecStatus);

  // Add handler for PEC filter change
  const handlePecStatusChange = (pecStatus: string) => {
    setSelectedPecStatus(pecStatus);
    const params: Record<string, string | number | null> = {
      page: 1,
      pecStatus: pecStatus || null,
    };
    router.push(`?${createQueryString(params)}`);
  };

  // Add this inside the DataTable component, after the existing state declarations
  // Get current search column from URL params
  const currentSearchColumn = searchParams?.get("searchColumn") || "";

  // Add state for search column
  const [searchColumn, setSearchColumn] =
    React.useState<string>(currentSearchColumn);

  // Add this function to handle search column change
  const handleSearchColumnChange = (column: string) => {
    setSearchColumn(column);
    const params: Record<string, string | number | null> = {
      page: 1,
      searchColumn: column || null,
    };
    router.push(`?${createQueryString(params)}`);
  };

  return (
    // Remove TooltipProvider wrapper
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <div className="relative max-w-xs">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ricerca nella tabella"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="pl-8 pr-10 w-[300px]"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 py-1"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Cerca in</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={searchColumn}
                  onValueChange={handleSearchColumnChange}
                >
                  <DropdownMenuRadioItem value="">
                    Tutti i campi
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="numeroFir">
                    N° formulario
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="produttore">
                    Produttore
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="trasportatore">
                    Trasportatore
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="destinatario">
                    Destinatario
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="intermediario">
                    Intermediario
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onClearDateRange={handleClearDateRange}
        />

        <DocumentsFilter
          selectedDocuments={selectedDocuments}
          onChange={handleDocumentsChange}
        />
        <PecFilter
          selectedPecStatus={selectedPecStatus}
          onChange={handlePecStatusChange}
        />

        {Object.keys(rowSelection).length > 0 ? (
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  // Get selected row indices
                  const selectedRowIndices = Object.keys(rowSelection);

                  // Get UIDs from selected rows
                  const selectedUIDs = selectedRowIndices
                    .map((index) => {
                      const rowIndex = parseInt(index);
                      const formulario = data[rowIndex] as FormularioUI;
                      return formulario.uid;
                    })
                    .filter((uid) => uid); // Filter out any undefined values

                  if (selectedUIDs.length === 0) {
                    console.error("No valid UIDs found for selected rows");
                    return;
                  }

                  // Make the API call to delete the formularios
                  const response = await fetch("/api/delete-formulario", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      uid_array: selectedUIDs,
                    }),
                  });

                  if (!response.ok) {
                    throw new Error(
                      `API call failed with status: ${response.status}`
                    );
                  }

                  console.log(
                    `Successfully deleted ${selectedUIDs.length} formularios`
                  );

                  // Clear row selection
                  setRowSelection({});

                  // Refresh the data table
                  handleRefreshData();

                  // Optional: Show a success toast notification
                  // toast.success(`${selectedUIDs.length} formularios eliminati con successo`);
                } catch (error) {
                  console.error("Error deleting formularios:", error);
                  // Optional: Show an error toast notification
                  // toast.error("Errore durante l'eliminazione dei formularios");
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Elimina
            </Button>
            {/* <Button 
							variant="outline" 
							onClick={() => {
								// Handle PEC action
								console.log('Send PEC for selected rows', rowSelection);
							}}
						>
							<Mail className="h-4 w-4" />
							Invia PEC
						</Button> */}
          </div>
        ) : (
          // Empty div to maintain layout when no rows are selected
          <div className="ml-auto"></div>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nessun risultato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {data.length} di {totalItems} risultati
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-sm text-muted-foreground">
            Pagina {currentPage} di {totalPages}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Precedente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Successiva
            </Button>
          </div>
        </div>
      </div>

      {/* Add the FormularioDetails drawer */}
      <FormularioDetails
        formulario={selectedFormulario}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRefresh={handleRefreshData}
      />
    </div>
    // Remove closing TooltipProvider tag
  );
}

function DateRangePicker({
  dateRange,
  onDateRangeChange,
  onClearDateRange,
}: {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onClearDateRange: () => void;
}) {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={`w-[220px] justify-start text-left font-normal ${
              !dateRange.from ? "text-muted-foreground" : ""
            }`} // Changed from w-[300px] to w-[220px]
          >
            <CalendarIcon className="h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "P", { locale: it })} -{" "}
                  {format(dateRange.to, "P", { locale: it })}
                </>
              ) : (
                format(dateRange.from, "P", { locale: it })
              )
            ) : (
              <span>Seleziona un intervallo</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={(range) => {
              if (range) {
                onDateRangeChange({
                  from: range.from,
                  to: range.to,
                });
              }
            }}
            numberOfMonths={2}
            locale={it}
          />
          {(dateRange.from || dateRange.to) && (
            <div className="p-3 border-t border-border">
              <Button
                variant="ghost"
                className="w-full"
                onClick={onClearDateRange}
              >
                Cancella
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
