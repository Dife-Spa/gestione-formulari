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
import {
  CalendarIcon,
  Search,
  ChevronDown,
  Trash2,
  Mail,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, } from "@/components/ui/dropdown-menu";
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
// Add import for InvioPecDialog
import { DeletionDialog } from "@/components/formulari/deletion-dialog";
import { InvioPecDialog } from "@/components/formulari/invio-pec-dialog";

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
  // Add state for the drawer
  const [selectedFormulario, setSelectedFormulario] =
    React.useState<FormularioUI | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [formulariToDelete, setFormulariToDelete] = React.useState<FormularioUI[]>([]);

  // Add state for PEC dialog
  const [invioPecDialogOpen, setInvioPecDialogOpen] = React.useState(false);
  const [formularioToSend, setFormularioToSend] = React.useState<FormularioUI[]>([]);

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

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    router.push(`?${createQueryString({ pageSize: size, page: 1 })}`);
  };

  // Add state for direct page navigation
  const [pageInput, setPageInput] = React.useState<string>(
    currentPage.toString()
  );

  // Update pageInput when currentPage changes
  React.useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(pageInput);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        goToPage(page);
      } else {
        setPageInput(currentPage.toString());
      }
    }
  };

  // Function to go to first page
  const goToFirstPage = () => {
    goToPage(1);
  };

  // Function to go to last page
  const goToLastPage = () => {
    goToPage(totalPages);
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

    // Function to handle delete confirmation
  const handleDeleteConfirmation = () => {
    const selectedFormulari = Object.keys(rowSelection).map(
      (index) => data[parseInt(index)] as FormularioUI
    );
    setFormulariToDelete(selectedFormulari);
    setDeleteDialogOpen(true);
  };

  // Function to handle successful deletion
  const handleDeleteSuccess = () => {
    // Clear row selection
    setRowSelection({});
    // Clear formulari to delete
    setFormulariToDelete([]);
    // Refresh the data table
    handleRefreshData();
  };

  // Add success handler for PEC sending
const handleSendPecSuccess = () => {
  setInvioPecDialogOpen(false);
  setFormularioToSend([]);
  handleRefreshData();
};

  // Function to execute the actual deletion
  const executeDelete = async () => {
    try {
      const selectedUIDs = formulariToDelete.map(formulario => formulario.uid);
      
      // Call the API to delete the selected formularios
      const response = await fetch("/api/delete-formulario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uids: selectedUIDs,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(
        `${selectedUIDs.length} formularios eliminati con successo`
      );

      // Clear row selection
      setRowSelection({});
      
      // Close dialog
      setDeleteDialogOpen(false);
      setFormulariToDelete([]);

      // Refresh the data table
      handleRefreshData();

      // Show success toast notification
      toast.success(`${selectedUIDs.length} formularios eliminati con successo`);
    } catch (error) {
      console.error("Error deleting formularios:", error);
      // Show error toast notification
      toast.error("Errore durante l'eliminazione dei formularios");
    }
  };


  return (
    // Remove TooltipProvider wrapper
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex gap-3">
          <Input
            placeholder="Cerca formulari..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="max-w-sm"
          />
          {/* Filter section */}
          <div className="flex items-center gap-2 pb-4">
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
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {/* PEC button - only visible when exactly one row is selected */}
          {Object.keys(rowSelection).length === 1 && (
            <Button 
              variant="outline"
              onClick={() => {
                // Get the selected formulario
                const selectedIndex = parseInt(Object.keys(rowSelection)[0]);
                const selectedFormulario = data[selectedIndex] as FormularioUI;
                
                if (selectedFormulario) {
                  setFormularioToSend([selectedFormulario]);
                  setInvioPecDialogOpen(true);
                }
              }}
            >
              <Mail className="h-4 w-4" />
              Invia PEC
            </Button>
          )}
          
          {/* Delete button - only visible when rows are selected */}
          {Object.keys(rowSelection).length > 0 && (
            <Button
              variant="outline"
              onClick={handleDeleteConfirmation}
            >
              <Trash2 className="h-4 w-4" />
              Elimina
            </Button>
          )}
          
          {/* Nuovo formulario button - always visible */}
          <Button
            onClick={() => {
              router.push("/formulari/aggiungi");
            }}
          >
            <Plus className="h-4 w-4" />
            Nuovo formulario
          </Button>
        </div>

      </div>
      
      
      
      <div className="rounded-md border h-[calc(100vh-350px)] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
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
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {data.length} di {totalItems} risultati
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                {pageSize} righe <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(parseInt(value))}
              >
                <DropdownMenuRadioItem value="15">
                  15 righe
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="30">
                  30 righe
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="50">
                  50 righe
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-sm text-muted-foreground">
            Pagina {currentPage} di {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToFirstPage}
              disabled={currentPage <= 1}
              title="Prima pagina"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              title="Pagina precedente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputKeyDown}
                className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Pagina successiva"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToLastPage}
              disabled={currentPage >= totalPages}
              title="Ultima pagina"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeletionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        formulariToDelete={formulariToDelete}
        onDeleteSuccess={handleDeleteSuccess}
      />

      {/* PEC Sending Dialog */}
      <InvioPecDialog
        open={invioPecDialogOpen}
        onOpenChange={setInvioPecDialogOpen}
        formulariToSend={formularioToSend}
        onSendSuccess={handleSendPecSuccess}
      />
      
      {/* Existing FormularioDetails drawer */}
      <FormularioDetails
        formulario={selectedFormulario}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRefresh={handleRefreshData}
      />
    </div>
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



