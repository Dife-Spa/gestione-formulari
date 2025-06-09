"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { MonthlyTable } from "@/components/dashboard/monthly-table";
import { TopProduttoriTable } from "@/components/dashboard/top-produttori-table";
import { supabase } from "@/lib/supabase";
import { PieChart, Calendar, Mail, FileIcon } from "lucide-react";
import { FormulariEmissionStats } from "@/components/dashboard/formulari-emission-stats";

export default function Page() {
  // State for all stats
  const [stats, setStats] = useState({
    total: 0,
    withAppuntamento: 0,
    withoutAppuntamento: 0,
    withPec: 0,
    withoutPec: 0,
    // Add document type counts
    withOriginale: 0,
    withFormulario: 0,
    withBuonoIntervento: 0,
    withScontrino: 0,
    loading: true,
  });

  // State for filter selections
  const [appuntamentoFilter, setAppuntamentoFilter] = useState("con");
  const [pecFilter, setPecFilter] = useState("inviata");
  // Add document type filter
  const [documentFilter, setDocumentFilter] = useState("file_input"); // Default to "Originale"

  // Fetch all stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Function to fetch all stats
  async function fetchStats() {
    try {
      setStats((prev) => ({ ...prev, loading: true }));

      // Get total count
      const { count: total } = await supabase
        .from("formulari")
        .select("*", { count: "exact", head: true });

      // Get count with appuntamento
      const { count: withAppuntamento } = await supabase
        .from("formulari")
        .select("*", { count: "exact", head: true })
        .not("id_appuntamento", "is", null);

      // Calculate without appuntamento
      const withoutAppuntamento = (total || 0) - (withAppuntamento || 0);

      // Get count with PEC sent
      const { count: withPec } = await supabase
        .from("formulari")
        .select("*", { count: "exact", head: true })
        .not("risultati_invio_pec", "is", null)
        .eq("risultati_invio_pec->status_code", 200);

      // Calculate without PEC
      const withoutPec = (total || 0) - (withPec || 0);

      // Get counts for each document type
      const { count: withOriginale } = await supabase
        .from("formulari")
        .select("*", { count: "exact", head: true })
        .not("file_paths->file_input", "is", null);

      const { count: withFormulario } = await supabase
        .from("formulari")
        .select("*", { count: "exact", head: true })
        .not("file_paths->formulario", "is", null);

      const { count: withBuonoIntervento } = await supabase
        .from("formulari")
        .select("*", { count: "exact", head: true })
        .not("file_paths->buono_intervento", "is", null);

      const { count: withScontrino } = await supabase
        .from("formulari")
        .select("*", { count: "exact", head: true })
        .not("file_paths->scontrino", "is", null);

      setStats({
        total: total || 0,
        withAppuntamento: withAppuntamento || 0,
        withoutAppuntamento,
        withPec: withPec || 0,
        withoutPec,
        withOriginale: withOriginale || 0,
        withFormulario: withFormulario || 0,
        withBuonoIntervento: withBuonoIntervento || 0,
        withScontrino: withScontrino || 0,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }

  // Get the current value to display based on filter selection
  const getAppuntamentoValue = () => {
    return appuntamentoFilter === "con"
      ? stats.withAppuntamento
      : stats.withoutAppuntamento;
  };

  // Get the current percentage to display based on filter selection
  const getAppuntamentoPercentage = () => {
    const value = getAppuntamentoValue();
    return value > 0 && stats.total > 0
      ? Math.round((value / stats.total) * 100)
      : 0;
  };

  // Get the current value to display based on filter selection
  const getPecValue = () => {
    return pecFilter === "inviata" ? stats.withPec : stats.withoutPec;
  };

  // Get the current percentage to display based on filter selection
  const getPecPercentage = () => {
    const value = getPecValue();
    return value > 0 && stats.total > 0
      ? Math.round((value / stats.total) * 100)
      : 0;
  };

  // Get the current document value based on filter selection
  const getDocumentValue = () => {
    switch (documentFilter) {
      case "file_input":
        return stats.withOriginale;
      case "formulario":
        return stats.withFormulario;
      case "buono_intervento":
        return stats.withBuonoIntervento;
      case "scontrino":
        return stats.withScontrino;
      default:
        return 0;
    }
  };

  // Get the document percentage based on filter selection
  const getDocumentPercentage = () => {
    const value = getDocumentValue();
    return value > 0 && stats.total > 0
      ? Math.round((value / stats.total) * 100)
      : 0;
  };

  // Get document label for description
  const getDocumentLabel = () => {
    switch (documentFilter) {
      case "file_input":
        return "Originale";
      case "formulario":
        return "Formulario";
      case "buono_intervento":
        return "Buono intervento";
      case "scontrino":
        return "Scontrino";
      default:
        return "";
    }
  };

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <h1>Hello world</h1>
                {/* Total Formulari Card */}
                <StatsCard
                  title="Totale Formulari"
                  value={stats.total}
                  percentage={
                    stats.total > 0 ? Math.round((stats.total / 100) * 10) : 0
                  }
                  description="Numero totale di formulari nel sistema"
                  isLoading={stats.loading}
                  icon={PieChart}
                />

                {/* Appuntamento Card with Filter */}
                <StatsCard
                  title="Per appuntamento"
                  value={getAppuntamentoValue()}
                  percentage={getAppuntamentoPercentage()}
                  description={`Formulari ${
                    appuntamentoFilter === "con" ? "con" : "senza"
                  } appuntamento`}
                  isLoading={stats.loading}
                  filterOptions={[
                    { label: "Con appuntamento", value: "con" },
                    { label: "Senza appuntamento", value: "senza" },
                  ]}
                  selectedFilter={appuntamentoFilter}
                  onFilterChange={setAppuntamentoFilter}
                  icon={Calendar}
                />

                {/* PEC Status Card with Filter */}
                <StatsCard
                  title="Per stato PEC"
                  value={getPecValue()}
                  percentage={getPecPercentage()}
                  description={`Formulari con PEC ${
                    pecFilter === "inviata" ? "inviata" : "non inviata"
                  }`}
                  isLoading={stats.loading}
                  filterOptions={[
                    { label: "PEC inviata", value: "inviata" },
                    { label: "PEC non inviata", value: "non_inviata" },
                  ]}
                  selectedFilter={pecFilter}
                  onFilterChange={setPecFilter}
                  icon={Mail}
                />

                {/* Document Type Card with Filter */}
                {/* <StatsCard
                  title="Per tipo documento"
                  value={getDocumentValue()}
                  percentage={getDocumentPercentage()}
                  description={`Formulari con documento ${getDocumentLabel()}`}
                  isLoading={stats.loading}
                  filterOptions={[
                    { label: "Originale", value: "file_input" },
                    { label: "Formulario", value: "formulario" },
                    { label: "Buono intervento", value: "buono_intervento" },
                    { label: "Scontrino", value: "scontrino" },
                  ]}
                  selectedFilter={documentFilter}
                  onFilterChange={setDocumentFilter}
                  icon={FileIcon}
                /> */}
              </div>

              <FormulariEmissionStats />

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
  );
}
