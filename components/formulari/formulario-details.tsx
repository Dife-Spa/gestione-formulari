"use client";
import { createBrowserClient } from "@supabase/ssr";
import * as React from "react";
import { FormularioUI } from "@/types/database.types";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  FileText,
  Truck,
  Building,
  User,
  Link,
  Check,
  X,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DeletionDialog } from "@/components/formulari/deletion-dialog";
import { InvioPecDialog } from "@/components/formulari/invio-pec-dialog";

interface FormularioDetailsProps {
  formulario: FormularioUI | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

/**
 * Drawer component to display detailed information about a formulario
 */
// Add this type definition at the top of the file, after the imports
type DatiFormulario = {
  trasporto?: {
    conducente?: string;
    ora_inizio?: string;
    data_inizio?: string;
    targa_automezzo?: string;
    targa_rimorchio?: string;
  };
  destinazione_info?: {
    ora_arrivo?: string;
    data_arrivo?: string;
    motivazioni?: string;
    attesa_verifica?: string;
    carico_accettato?: string;
    quantita_respinta?: string;
    quantita_accettata?: string;
  };
  destinatario_info?: {
    ora_arrivo?: string;
    data_arrivo?: string;
    motivazioni?: string;
    attesa_verifica?: string;
    carico_accettato?: string;
    quantita_respinta?: string;
    quantita_accettata?: string;
  };
  // Replace direct properties with nested caratteristiche_rifiuto object
  caratteristiche_rifiuto?: {
    eer?: string;
    quantita?: string | number;
    unita_misura?: string;
    stato_fisico?: string;
    aspetto?: string;
    peso_verificato_partenza?: string;
  };
};

export function FormularioDetails({
  formulario,
  open,
  onOpenChange,
  onRefresh,
}: FormularioDetailsProps) {
  // Initialize state variables first, before any conditional returns
  const [editingCodice, setEditingCodice] = React.useState(false);
  const [editingIdAppuntamento, setEditingIdAppuntamento] =
    React.useState(false);
  const [codiceValue, setCodiceValue] = React.useState("");
  const [idAppuntamentoValue, setIdAppuntamentoValue] = React.useState("");
  const [editingPecDestinatario, setEditingPecDestinatario] =
    React.useState(false);
  const [pecDestinatarioValue, setPecDestinatarioValue] = React.useState("");
  const [editingPecOptions, setEditingPecOptions] = React.useState(false);
  const [riceveFormularioValue, setRiceveFormularioValue] =
    React.useState(false);
  const [riceveScontrinoValue, setRiceveScontrinoValue] = React.useState(false);
  const [originalCodiceValue, setOriginalCodiceValue] = React.useState("");
  const [originalIdAppuntamentoValue, setOriginalIdAppuntamentoValue] =
    React.useState("");
  const [originalPecDestinatarioValue, setOriginalPecDestinatarioValue] =
    React.useState("");
  const [originalRiceveFormularioValue, setOriginalRiceveFormularioValue] =
    React.useState(false);
  const [originalRiceveScontrinoValue, setOriginalRiceveScontrinoValue] =
    React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [formularioToDelete, setFormularioToDelete] = React.useState<FormularioUI[]>([]);
  const [invioPecDialogOpen, setInvioPecDialogOpen] = React.useState(false);
  const [formularioToSend, setFormularioToSend] = React.useState<FormularioUI[]>([]);
  
  // Add success handler for deletion
  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setFormularioToDelete([]);
    onOpenChange(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleSendPecSuccess = () => {
    setInvioPecDialogOpen(false);
    setFormularioToSend([]);
    // Optionally close the drawer or refresh data
    if (onRefresh) {
      onRefresh();
    }
  };

  // Add useEffect to update state when formulario changes - MOVED BEFORE CONDITIONAL RETURN
  React.useEffect(() => {
    if (formulario) {
      // Update current values
      setCodiceValue(formulario.codice || "");
      setIdAppuntamentoValue(formulario.id_appuntamento || "");
      // Only access datiInvioPec if formulario exists and has been parsed
      const pecData = formulario.dati_invio_pec
        ? typeof formulario.dati_invio_pec === "string"
          ? JSON.parse(formulario.dati_invio_pec)
          : formulario.dati_invio_pec
        : {};
      setPecDestinatarioValue(pecData?.pec_destinatario || "");
      setRiceveFormularioValue(pecData?.riceveFormulario || false);
      setRiceveScontrinoValue(pecData?.riceveScontrino || false);

      // Update original values for cancel functionality
      setOriginalCodiceValue(formulario.codice || "");
      setOriginalIdAppuntamentoValue(formulario.id_appuntamento || "");
      setOriginalPecDestinatarioValue(pecData?.pec_destinatario || "");
      setOriginalRiceveFormularioValue(pecData?.riceveFormulario || false);
      setOriginalRiceveScontrinoValue(pecData?.riceveScontrino || false);
    }
  }, [formulario]);

  // Now we can safely have conditional returns
  if (!formulario) return null;

  // First, parse all the JSON data
  // Parse dati_formulario JSON if it exists
  const datiFormulario: DatiFormulario = formulario.dati_formulario
    ? typeof formulario.dati_formulario === "string"
      ? JSON.parse(formulario.dati_formulario)
      : formulario.dati_formulario
    : {};

  // Parse dati_appuntamento JSON if it exists
  const datiAppuntamento = formulario.dati_appuntamento
    ? typeof formulario.dati_appuntamento === "string"
      ? JSON.parse(formulario.dati_appuntamento)
      : formulario.dati_appuntamento
    : {};

  // Parse dati_invio_pec JSON if it exists
  const datiInvioPec = formulario.dati_invio_pec
    ? typeof formulario.dati_invio_pec === "string"
      ? JSON.parse(formulario.dati_invio_pec)
      : formulario.dati_invio_pec
    : {};

  // Extract transport data
  const trasporto = datiFormulario.trasporto || {};

  // Extract destination data - handle both possible field names
  const destinazioneInfo =
    datiFormulario.destinazione_info || datiFormulario.destinatario_info || {};

  // Then, initialize state variables
  // Add these handler functions
  const handleSaveCodice = async () => {
    if (!formulario?.uid) {
      console.error("UID del formulario non disponibile");
      toast.error("UID del formulario non disponibile");
      return;
    }

    try {
      // Create form data for the API call
      const formData = new FormData();
      formData.append("uid", formulario.uid);
      formData.append("new_fir", codiceValue);

      console.log("Updating formulario number:", {
        uid: formulario.uid,
        new_fir: codiceValue,
      });

      // Use proxy API route to avoid CORS issues
      const response = await fetch("/api/aggiorna-formulario", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `Errore HTTP: ${response.status} - ${
            errorData.error || response.statusText
          }`
        );
      }

      const result = await response.json();
      console.log("Formulario aggiornato con successo:", result);

      // Update local state only after successful API call
      setEditingCodice(false);
      setOriginalCodiceValue(codiceValue); // Update the original value

      // Refresh the parent table to show updated data
      if (onRefresh) {
        onRefresh();
      }

      // Show success notification
      toast.success("Numero formulario aggiornato con successo");
    } catch (error) {
      console.error("Errore durante l'aggiornamento del formulario:", error);
      console.error(
        "Dettagli errore:",
        error instanceof Error ? error.message : String(error)
      );

      // Reset to original value on error
      setCodiceValue(originalCodiceValue);
      setEditingCodice(false);

      // Show error notification
      toast.error("Errore durante l'aggiornamento del numero formulario");
    }
  };

  const handleSaveIdAppuntamento = async () => {
    if (!formulario?.uid) {
      console.error("UID del formulario non disponibile");
      toast.error("UID del formulario non disponibile");
      return;
    }

    try {
      // Create form data for the API call
      const formData = new FormData();
      formData.append("uid", formulario.uid);
      formData.append("new_appuntamento", idAppuntamentoValue);

      console.log("Updating appointment ID:", {
        uid: formulario.uid,
        new_appuntamento: idAppuntamentoValue,
      });

      // Use proxy API route to avoid CORS issues
      const response = await fetch("/api/aggiorna-formulario", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `Errore HTTP: ${response.status} - ${
            errorData.error || response.statusText
          }`
        );
      }

      const result = await response.json();
      console.log("ID Appuntamento aggiornato con successo:", result);

      // Update local state only after successful API call
      setEditingIdAppuntamento(false);
      setOriginalIdAppuntamentoValue(idAppuntamentoValue); // Update the original value

      // Refresh the parent table to show updated data
      if (onRefresh) {
        onRefresh();
      }

      // Show success notification
      toast.success("ID Appuntamento aggiornato con successo");
    } catch (error) {
      console.error(
        "Errore durante l'aggiornamento dell'ID Appuntamento:",
        error
      );

      // Reset to original value on error
      setIdAppuntamentoValue(originalIdAppuntamentoValue);
      setEditingIdAppuntamento(false);

      // Show error notification
      toast.error("Errore durante l'aggiornamento dell'ID Appuntamento");
    }
  };

  // Add this new handler for PEC destinatario
  const handleSavePecDestinatario = () => {
    // Here you would typically save the value to the database
    // For now, we'll just update the local state
    setEditingPecDestinatario(false);
  };

  // Add this new handler for PEC options
  const handleSavePecOptions = () => {
    // Here you would typically save the values to the database
    // For now, we'll just update the local state
    setEditingPecOptions(false);
  };

  // Add cancel handler functions
  const handleCancelCodice = () => {
    setCodiceValue(originalCodiceValue);
    setEditingCodice(false);
  };

  const handleCancelIdAppuntamento = () => {
    setIdAppuntamentoValue(originalIdAppuntamentoValue);
    setEditingIdAppuntamento(false);
  };

  const handleCancelPecDestinatario = () => {
    setPecDestinatarioValue(originalPecDestinatarioValue);
    setEditingPecDestinatario(false);
  };

  const handleCancelPecOptions = () => {
    setRiceveFormularioValue(originalRiceveFormularioValue);
    setRiceveScontrinoValue(originalRiceveScontrinoValue);
    setEditingPecOptions(false);
  };

  // Extract caratteristiche rifiuto data
  const caratteristicheRifiuto = datiFormulario.caratteristiche_rifiuto || {};

  // Format date for display
  const formattedDate = formulario.data
    ? format(new Date(formulario.data), "dd/MM/yyyy", { locale: it })
    : "Data non disponibile";

  // Status badge styles and labels
  const statusStyles = {
    in_attesa: "bg-yellow-100 text-yellow-800",
    approvato: "bg-green-100 text-green-800",
    rifiutato: "bg-red-100 text-red-800",
    completato: "bg-blue-100 text-blue-800",
  };

  const statusLabels = {
    in_attesa: "In attesa",
    approvato: "Approvato",
    rifiutato: "Rifiutato",
    completato: "Completato",
  };

  // Add this new handler to reset editing states when drawer closes
  const handleDrawerOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset all editing states and revert values when drawer closes
      if (editingCodice) {
        setCodiceValue(originalCodiceValue);
        setEditingCodice(false);
      }
      if (editingIdAppuntamento) {
        setIdAppuntamentoValue(originalIdAppuntamentoValue);
        setEditingIdAppuntamento(false);
      }
      if (editingPecDestinatario) {
        setPecDestinatarioValue(originalPecDestinatarioValue);
        setEditingPecDestinatario(false);
      }
      if (editingPecOptions) {
        setRiceveFormularioValue(originalRiceveFormularioValue);
        setRiceveScontrinoValue(originalRiceveScontrinoValue);
        setEditingPecOptions(false);
      }
    }
    onOpenChange(isOpen);
  };

  return (
    <Drawer open={open} onOpenChange={handleDrawerOpenChange} direction="bottom">
      <DrawerContent className="">
        <div className="mx-auto w-full max-w-[80%] pb-12">
          <DrawerHeader className="pb-2 flex flex-row justify-between items-end">
            <div>
              <DrawerTitle className="text-xl flex items-center gap-2">
                Dettagli Formulario: {formulario.codice}
              </DrawerTitle>
              <DrawerDescription className="text-sm">
                Informazioni complete sul formulario
              </DrawerDescription>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                disabled={!datiInvioPec?.pec_destinatario}
                title={
                  !datiInvioPec?.pec_destinatario
                    ? "Destinatario PEC non specificato"
                    : "Invia PEC"
                }
                onClick={() => {
                  if (formulario) {
                    setFormularioToSend([formulario]);
                    setInvioPecDialogOpen(true);
                  }
                }}
              >
                <Mail className="h-4 w-4" />
                Invia PEC
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => {
                  if (formulario) {
                    setFormularioToDelete([formulario]);
                    setDeleteDialogOpen(true);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost">Chiudi</Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="p-4 space-y-6">
            {/* Main content grid with 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Informazioni Principali */}
              <Card className="justify-between">
                <CardHeader>
                  <CardTitle>Informazioni Principali</CardTitle>
                  <CardDescription>
                    Dettagli del formulario e delle parti coinvolte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Numero Formulario and ID Appuntamento in card-like containers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Numero Formulario */}
                    <div className="border rounded-md p-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Numero Formulario
                      </div>
                      <div className="flex items-center justify-between">
                        {editingCodice ? (
                          <div className="flex-1 mr-2">
                            <Input
                              value={codiceValue}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => setCodiceValue(e.target.value)}
                              className="font-medium"
                            />
                          </div>
                        ) : (
                          <div className="font-medium">{codiceValue}</div>
                        )}
                        <div className="flex">
                          {editingCodice && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={handleCancelCodice}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              if (editingCodice) {
                                handleSaveCodice();
                              } else {
                                setEditingCodice(true);
                              }
                            }}
                          >
                            {editingCodice ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Pencil className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* ID Appuntamento */}
                    <div className="border rounded-md p-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        ID Appuntamento
                      </div>
                      <div className="flex items-center justify-between">
                        {editingIdAppuntamento ? (
                          <div className="flex-1 mr-2">
                            <Input
                              value={idAppuntamentoValue}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => setIdAppuntamentoValue(e.target.value)}
                              className="font-medium"
                            />
                          </div>
                        ) : (
                          <div className="font-medium">
                            {idAppuntamentoValue || "N/A"}
                          </div>
                        )}
                        <div className="flex">
                          {editingIdAppuntamento && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={handleCancelIdAppuntamento}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {(!formulario.id_appuntamento || formulario.id_appuntamento === "") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                if (editingIdAppuntamento) {
                                  handleSaveIdAppuntamento();
                                } else {
                                  setEditingIdAppuntamento(true);
                                }
                              }}
                            >
                              {editingIdAppuntamento ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Pencil className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Data Emissione */}
                  <div className="flex justify-between items-center py-3 mb-0 border-b">
                    <span className="text-xs font-medium text-muted-foreground">
                      Data Emissione
                    </span>
                    <span className="text-xs">{formattedDate}</span>
                  </div>

                  {/* Produttore with address */}
                  <div className="py-3 mb-0 border-b">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        Produttore
                      </span>
                      <span className="text-xs">{formulario.produttore}</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-right mt-1">
                      {formulario.unita_locale_produttore ||
                        "Indirizzo non disponibile"}
                    </div>
                  </div>

                  {/* Destinatario with address */}
                  <div className="py-3 mb-0 border-b">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        Destinatario
                      </span>
                      <span className="text-xs">{formulario.destinatario}</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-right mt-1">
                      {formulario.unita_locale_destinatario ||
                        "Indirizzo non disponibile"}
                    </div>
                  </div>

                  {/* Trasportatore */}
                  <div className="flex justify-between items-center py-3 mb-0 border-b">
                    <span className="text-xs font-medium text-muted-foreground">
                      Trasportatore
                    </span>
                    <span className="text-xs">
                      {formulario.trasportatore || "Non specificato"}
                    </span>
                  </div>

                  {/* Intermediario */}
                  <div className="flex justify-between items-center py-3 mb-0 border-b">
                    <span className="text-xs font-medium text-muted-foreground">
                      Intermediario
                    </span>
                    <span className="text-xs">
                      {formulario.intermediario || "Non specificato"}
                    </span>
                  </div>

                  {/* ID Univoco */}
                  <div className="flex justify-between items-center py-3 mb-0 border-b">
                    <span className="text-xs font-medium text-muted-foreground">
                      ID Univoco
                    </span>
                    <span className="text-xs">{formulario.uid}</span>
                  </div>

                  {/* Separator for Caratteristiche Rifiuto section */}
                  <div className="pt-2">
                    <h3 className="font-medium text-sm my-2">
                      Caratteristiche Rifiuto
                    </h3>

                    {/* Codice EER */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Codice EER
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {caratteristicheRifiuto.eer || "Non specificato"}
                      </Badge>
                    </div>

                    {/* Quantità */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Quantità
                      </span>
                      <span className="text-xs">
                        {(() => {
                          const quantity = datiAppuntamento?.quantitaRealeKg ||
                            caratteristicheRifiuto.quantita ||
                            formulario.quantita;
                          if (quantity && quantity !== "non presente" && quantity !== "-") {
                            const numValue = parseFloat(quantity.toString());
                            if (!isNaN(numValue)) {
                              return `${numValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;
                            }
                          }
                          return quantity || "-";
                        })()}
                      </span>
                    </div>

                    {/* Stato Fisico */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Stato Fisico
                      </span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        {caratteristicheRifiuto.stato_fisico ||
                          "Non specificato"}
                      </Badge>
                    </div>

                    {/* Aspetto */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Aspetto
                      </span>
                      <span className="text-xs">
                        {caratteristicheRifiuto.aspetto || "Non specificato"}
                      </span>
                    </div>

                    {/* Peso Verificato Partenza */}
                    <div className="flex justify-between items-center py-3 mb-0">
                      <span className="text-xs font-medium text-muted-foreground">
                        Peso Verificato Partenza
                      </span>
                      <span className="text-xs">
                        {caratteristicheRifiuto.peso_verificato_partenza ||
                          "Non specificato"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Column 2: Dettagli Trasporto */}
              <Card className="justify-between">
                <CardHeader>
                  <CardTitle>Dettagli Trasporto</CardTitle>
                  <CardDescription>
                    Informazioni sul trasporto e destinazione
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Dati Trasporto Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Dati Trasporto</h3>

                    {/* Conducente */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Conducente
                      </span>
                      <span className="text-xs">
                        {trasporto.conducente || "Non specificato"}
                      </span>
                    </div>

                    {/* Data Inizio */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Data Inizio
                      </span>
                      <span className="text-xs">
                        {trasporto.data_inizio || formattedDate}
                      </span>
                    </div>

                    {/* Ora Inizio */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Ora Inizio
                      </span>
                      <span className="text-xs">
                        {trasporto.ora_inizio || "Non specificato"}
                      </span>
                    </div>

                    {/* Targa Automezzo */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Targa Automezzo
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {trasporto.targa_automezzo || "Non specificato"}
                      </Badge>
                    </div>

                    {/* Targa Rimorchio */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Targa Rimorchio
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {trasporto.targa_rimorchio === "non presente" ? "Non presente" : (trasporto.targa_rimorchio || "Non presente")}
                      </Badge>
                    </div>
                  </div>

                  {/* Dati Destinazione Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">
                      Dati Destinazione
                    </h3>

                    {/* Data Arrivo */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Data Arrivo
                      </span>
                      <span className="text-xs">
                        {destinazioneInfo.data_arrivo || formattedDate}
                      </span>
                    </div>

                    {/* Ora Arrivo */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Ora Arrivo
                      </span>
                      <span className="text-xs">
                        {destinazioneInfo.ora_arrivo || "Non specificato"}
                      </span>
                    </div>

                    {/* Carico Accettato */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Carico Accettato
                      </span>
                      <span className="text-xs">
                        {destinazioneInfo.carico_accettato 
                          ? destinazioneInfo.carico_accettato.charAt(0).toUpperCase() + destinazioneInfo.carico_accettato.slice(1).toLowerCase()
                          : "Non specificato"}
                      </span>
                    </div>

                    {/* Quantità Accettata */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Quantità Accettata
                      </span>
                      <span className="text-xs">
                        {(() => {
                          const quantity = destinazioneInfo.quantita_accettata;
                          if (quantity && quantity !== "non presente") {
                            const numValue = parseFloat(quantity.toString());
                            if (!isNaN(numValue)) {
                              return `${numValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;
                            }
                          }
                          return quantity || "Non specificato";
                        })()} 
                      </span>
                    </div>

                    {/* Quantità Respinta */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Quantità Respinta
                      </span>
                      <span className="text-xs">
                        {(() => {
                          const quantity = destinazioneInfo.quantita_respinta;
                          if (quantity === "non presente") {
                            return "Non presente";
                          }
                          if (quantity) {
                            const numValue = parseFloat(quantity.toString());
                            if (!isNaN(numValue)) {
                              return `${numValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;
                            }
                          }
                          return "Non specificato";
                        })()} 
                      </span>
                    </div>

                    {/* Attesa Verifica */}
                    <div className="flex justify-between items-center py-3 mb-0 border-b">
                      <span className="text-xs font-medium text-muted-foreground">
                        Attesa Verifica
                      </span>
                      <span className="text-xs">
                        {destinazioneInfo.attesa_verifica || "Non specificato"}
                      </span>
                    </div>

                    {/* Motivazioni */}
                    <div className="flex justify-between items-center py-3 mb-0">
                      <span className="text-xs font-medium text-muted-foreground">
                        Motivazioni
                      </span>
                      <span className="text-xs">
                        {destinazioneInfo.motivazioni === "non presente" ? "Non presente" : (destinazioneInfo.motivazioni || "Non specificato")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4">
                {/* Column 3: Dati PEC */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dati PEC</CardTitle>
                    <CardDescription>
                      Informazioni per l'invio PEC
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Destinatario PEC */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Destinatario PEC
                      </h4>
                      <div className="border rounded-md p-3 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {editingPecDestinatario ? (
                          <div className="flex-1 mr-2">
                            <Input
                              value={pecDestinatarioValue}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => setPecDestinatarioValue(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        ) : (
                          <span
                            className={`text-sm ${
                              pecDestinatarioValue
                                ? ""
                                : "text-muted-foreground"
                            }`}
                          >
                            {pecDestinatarioValue ||
                              "Indirizzo PEC non specificato"}
                          </span>
                        )}
                        {/* <div className="flex ml-auto">
													{editingPecDestinatario && (
														<Button 
															variant="ghost" 
															size="icon" 
															className="h-6 w-6"
															onClick={handleCancelPecDestinatario}
														>
															<X className="h-4 w-4" />
														</Button>
													)}
													<Button 
														variant="ghost" 
														size="icon" 
														className="h-6 w-6"
														onClick={() => {
															if (editingPecDestinatario) {
																handleSavePecDestinatario();
															} else {
																setEditingPecDestinatario(true);
															}
														}}
													>
														{editingPecDestinatario ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
													</Button>
												</div> */}
                      </div>
                    </div>

                    {/* Opzioni di Invio section */}
                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium">
                          Opzioni di Invio
                        </h4>
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            if (editingPecOptions) {
                              handleSavePecOptions();
                            } else {
                              setEditingPecOptions(true);
                            }
                          }}
                        >
                          {editingPecOptions ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Pencil className="h-4 w-4" />
                          )}
                        </Button> */}
                      </div>

                      {/* Riceve Formulario toggle */}
                      <div className="flex items-center justify-between mb-3 border rounded-md p-3">
                        <div>
                          <p className="text-sm font-medium">
                            Riceve Formulario
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Il destinatario riceverà il file del formulario via
                            PEC
                          </p>
                        </div>
                        <Switch
                          checked={
                            editingPecOptions
                              ? riceveFormularioValue
                              : datiInvioPec.riceveFormulario || false
                          }
                          onCheckedChange={
                            editingPecOptions
                              ? setRiceveFormularioValue
                              : undefined
                          }
                          disabled={!editingPecOptions}
                          id="riceve-formulario"
                          aria-label="Riceve Formulario"
                        />
                      </div>

                      {/* Riceve Scontrino toggle */}
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <p className="text-sm font-medium">
                            Riceve Scontrino
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Il destinatario riceverà il file dello scontrino via
                            PEC
                          </p>
                        </div>
                        <Switch
                          checked={
                            editingPecOptions
                              ? riceveScontrinoValue
                              : datiInvioPec.riceveScontrino || false
                          }
                          onCheckedChange={
                            editingPecOptions
                              ? setRiceveScontrinoValue
                              : undefined
                          }
                          disabled={!editingPecOptions}
                          id="riceve-scontrino"
                          aria-label="Riceve Scontrino"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documenti Section */}
                <Card className="h-full justify-between">
                  <CardHeader>
                    <CardTitle>Documenti</CardTitle>
                    <CardDescription>
                      Documenti disponibili per questo formulario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      {/* Originale document */}
                      <a
                        href={formulario.file_paths?.file_input || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "rounded-md p-2 flex items-center text-sm font-medium gap-2",
                          formulario.file_paths?.file_input
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                        )}
                        onClick={(e) =>
                          !formulario.file_paths?.file_input &&
                          e.preventDefault()
                        }
                      >
                        <FileText className="h-4 w-4" />
                        Originale
                      </a>
                      {/* Formulario document */}
                      <a
                        href={formulario.file_paths?.formulario || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "border rounded-md p-2 flex items-center text-sm font-medium gap-2",
                          formulario.file_paths?.formulario
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                        )}
                        onClick={(e) =>
                          !formulario.file_paths?.formulario &&
                          e.preventDefault()
                        }
                      >
                        <FileText className="h-4 w-4" />
                        Formulario
                      </a>

                      {/* Buono Intervento document */}
                      <a
                        href={formulario.file_paths?.buono_intervento || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "border rounded-md p-2 flex items-center text-sm font-medium gap-2",
                          formulario.file_paths?.buono_intervento
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                        )}
                        onClick={(e) =>
                          !formulario.file_paths?.buono_intervento &&
                          e.preventDefault()
                        }
                      >
                        <FileText className="h-4 w-4" />
                        Buono Intervento
                      </a>

                      {/* Scontrino document */}
                      <a
                        href={formulario.file_paths?.scontrino || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "border rounded-md p-2 flex items-center text-sm font-medium gap-2",
                          formulario.file_paths?.scontrino
                            ? "bg-purple-500 hover:bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                        )}
                        onClick={(e) =>
                          !formulario.file_paths?.scontrino &&
                          e.preventDefault()
                        }
                      >
                        <FileText className="h-4 w-4" />
                        Scontrino
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
      {/* Use the reusable DeletionDialog component */}
      <DeletionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        formulariToDelete={formularioToDelete}
        onDeleteSuccess={handleDeleteSuccess}
      />
      
      {/* PEC Sending Dialog */}
      <InvioPecDialog
        open={invioPecDialogOpen}
        onOpenChange={setInvioPecDialogOpen}
        formulariToSend={formularioToSend}
        onSendSuccess={handleSendPecSuccess}
      />
    </Drawer>
  );
}
