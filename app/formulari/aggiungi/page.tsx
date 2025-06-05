"use client"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/sidebar/site-header"
import { FileUpload } from "@/components/formulari/aggiungi/file-upload"
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
              <h1 className="text-2xl font-bold">Aggiungi Formulario</h1>
              <div className="bg-muted/50 p-6 rounded-xl">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Carica un formulario in PDF
                    </label>
                    <div className="mt-2">
                      <FileUpload
                        onFileSelect={(file) => {
                          if (file) {
                            console.log('Selected file:', file.name)
                          }
                        }}
                        accept=".pdf"
                        placeholder="Seleziona un file (PDF)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}