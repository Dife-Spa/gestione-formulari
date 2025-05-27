import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/sidebar/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const description = "Gestione dei formulari esistenti."

export default function FormulariPage() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* Formulari content goes here */}
              <h1 className="text-2xl font-bold">Formulari</h1>
              <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                {/* Table or list of formulari will go here */}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}