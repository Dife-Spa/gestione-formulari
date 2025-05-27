import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/sidebar/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { getFormulari } from "@/lib/formulari-service"
import { Suspense } from "react"
import Loading from "./loading"

export const description = "Gestione dei formulari esistenti."

/**
 * Server Component for Formulari page with data fetching
 */
export default async function FormulariPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Extract search parameters for server-side filtering
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = (params.search as string) || ''
  const status = (params.status as string) || ''
  const sortBy = (params.sortBy as string) || 'created_at'
  const sortOrder = (params.sortOrder as 'asc' | 'desc') || 'desc'

  // Fetch data server-side
  const formulariData = await getFormulari({
    page,
    pageSize: 20,
    search,
    status,
    sortBy,
    sortOrder,
  })

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
                <div className="text-sm text-muted-foreground">
                  Totale: {formulariData.total} formulari
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <Suspense fallback={<Loading />}>
                  <DataTable 
                    columns={columns} 
                    data={formulariData.data}
                    totalItems={formulariData.total}
                    totalPages={formulariData.totalPages}
                    currentPage={formulariData.page}
                    pageSize={formulariData.pageSize}
                  />
                </Suspense>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}