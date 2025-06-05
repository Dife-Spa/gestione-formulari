"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/sidebar/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { StatsCard } from "@/components/dashboard/stats-card"
import { MonthlyTable } from "@/components/dashboard/monthly-table"
import { TopProduttoriTable } from "@/components/dashboard/top-produttori-table"
import { supabase } from "@/lib/supabase"

export const description = "Dashboard with formulari statistics."

export default function Page() {
  const [stats, setStats] = useState({
    total: 0,
    withAppuntamento: 0,
    withoutAppuntamento: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Use the imported supabase client directly
        
        // Get total count
        const { count: total } = await supabase
          .from('formulari')
          .select('*', { count: 'exact', head: true })
        
        // Get count with appuntamento
        const { count: withAppuntamento } = await supabase
          .from('formulari')
          .select('*', { count: 'exact', head: true })
          .not('id_appuntamento', 'is', null)
        
        // Calculate without appuntamento
        const withoutAppuntamento = (total || 0) - (withAppuntamento || 0)
        
        setStats({
          total: total || 0,
          withAppuntamento: withAppuntamento || 0,
          withoutAppuntamento,
          loading: false
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    
    fetchStats()
  }, [])

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                {/* Total Formulari Card */}
                <StatsCard
                  title="Totale Formulari"
                  value={stats.total}
                  percentage={stats.total > 0 ? Math.round((stats.total / 100) * 10) : 0}
                  description="Steady performance increase"
                  isLoading={stats.loading}
                />

                {/* With Appuntamento Card */}
                <StatsCard
                  title="Con appuntamento"
                  value={stats.withAppuntamento}
                  percentage={stats.withAppuntamento > 0 ? Math.round((stats.withAppuntamento / stats.total) * 100) : 0}
                  description="Meets growth projections"
                  isLoading={stats.loading}
                />

                {/* Without Appuntamento Card */}
                <StatsCard
                  title="Senza appuntamento"
                  value={stats.withoutAppuntamento}
                  percentage={stats.withoutAppuntamento > 0 ? Math.round((stats.withoutAppuntamento / stats.total) * 100) : 0}
                  description="Needs attention"
                  isLoading={stats.loading}
                />
              </div>
              
              {/* Tables Section */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Monthly Formulari Table */}
                <MonthlyTable />
                
                {/* Top Produttori Table */}
                <TopProduttoriTable />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
