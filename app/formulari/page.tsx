import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getFormulari } from "@/lib/formulari-service";
import { Suspense } from "react";
import Loading, { FormulariTableSkeleton } from "./loading";

// Remove this line - it's not a valid Next.js export
// export const description = "Gestione dei formulari esistenti.";

/**
 * Server Component for Formulari page with data fetching
 */
export default async function FormulariPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract search parameters for server-side filtering
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = (params.search as string) || "";
  const status = (params.status as string) || "";
  const sortBy = (params.sortBy as string) || "created_at";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const dateFrom = (params.dateFrom as string) || "";
  const dateTo = (params.dateTo as string) || "";
  const documents = (params.documents as string) || "";
  const pecStatus = (params.pecStatus as string) || "";
  const searchColumn = (params.searchColumn as string) || ""; // Add this line

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Formulari</h1>
                {/* <div className="text-sm text-muted-foreground">
                  Totale: {formulariData.total} formulari
                </div> */}
              </div>
              <p className="text-muted-foreground max-w-[50%]">
                Gestisci e visualizza tutti i formulari di identificazione dei
                rifiuti. Puoi cercare, filtrare, visualizzare i dettagli e
                gestire le operazioni sui formulari registrati nel sistema.
              </p>
              <div className="rounded-xl overflow-hidden">
                <Suspense fallback={<FormulariTableSkeleton />}>
                  {/* Move data fetching inside the Suspense boundary */}
                  <FormulariDataTable searchParams={params} />
                </Suspense>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

// Create a new component to handle data fetching inside the Suspense boundary
async function FormulariDataTable({ searchParams }: { searchParams: any }) {
  // Get pageSize from URL params or default to 15
  const pageSize = Number(searchParams.pageSize) || 15;

  // Fetch data server-side
  const formulariData = await getFormulari({
    page: Number(searchParams.page) || 1,
    pageSize: pageSize,
    search: (searchParams.search as string) || "",
    status: (searchParams.status as string) || "",
    dateFrom: (searchParams.dateFrom as string) || "",
    dateTo: (searchParams.dateTo as string) || "",
    sortBy: (searchParams.sortBy as string) || "created_at",
    sortOrder: (searchParams.sortOrder as "asc" | "desc") || "desc",
    documents: (searchParams.documents as string) || "",
    pecStatus: (searchParams.pecStatus as string) || "",
    searchColumn: (searchParams.searchColumn as string) || "",
  });

  return (
    <DataTable
      columns={columns}
      data={formulariData.data}
      totalItems={formulariData.total}
      totalPages={formulariData.totalPages}
      currentPage={formulariData.page}
      pageSize={formulariData.pageSize}
    />
  );
}
