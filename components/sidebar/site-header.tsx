"use client"

import { SidebarIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { SearchForm } from "@/components/sidebar/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

/**
 * Generate breadcrumb items based on the current pathname
 * @param pathname - Current route pathname
 * @returns Array of breadcrumb items
 */
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard', isLast: false }
  ]

  // If we're not on dashboard, add current page
  if (pathname !== '/dashboard' && pathname !== '/') {
    let currentPath = ''
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      // Convert segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      if (segment === 'formulari') label = 'Formulari'
      if (segment === 'aggiungi') label = 'Aggiungi Formulario'
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isLast
      })
    })
  } else {
    // If on dashboard, mark it as last
    breadcrumbs[0].isLast = true
  }

  return breadcrumbs
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!crumb.isLast && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {/* <SearchForm className="w-full sm:ml-auto sm:w-auto" /> */}
      </div>
    </header>
  )
}
