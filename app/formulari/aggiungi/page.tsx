import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/sidebar/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const description = "Aggiungi un nuovo formulario."

export default function AggiungiFormularioPage() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* Aggiungi formulario content goes here */}
              <h1 className="text-2xl font-bold">Aggiungi Formulario</h1>
              <div className="bg-muted/50 p-6 rounded-xl">
                {/* Form for adding new formulario will go here */}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}