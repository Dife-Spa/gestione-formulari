"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormularioUI } from "@/types/database.types";
import { Mail, FileText, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DatiInvioPec {
  pec_destinatario: string;
  riceveFormulario: boolean;
  riceveScontrino: boolean;
}

interface InvioPecDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formulariToSend: FormularioUI[];
  onSendSuccess?: () => void;
}

/**
 * Reusable PEC sending confirmation dialog for formularios
 * Displays the PEC recipient and documents that will be sent
 * Handles the API call for sending PEC with proper error handling
 */
export function InvioPecDialog({
  open,
  onOpenChange,
  formulariToSend,
  onSendSuccess,
}: InvioPecDialogProps) {
  const [isSending, setIsSending] = React.useState(false);

  /**
   * Execute the PEC sending API call
   */
  const executeSendPec = async () => {
    if (formulariToSend.length === 0) return;

    setIsSending(true);
    try {
      const selectedUIDs = formulariToSend.map(formulario => formulario.uid);
      
      // Call the API to send PEC for the selected formularios
      const response = await fetch("/api/send-pec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid_array: selectedUIDs,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(
        `PEC inviata per ${selectedUIDs.length} formulario${selectedUIDs.length > 1 ? 'i' : ''} con successo`
      );

      // Close dialog
      onOpenChange(false);

      // Call success callback
      if (onSendSuccess) {
        onSendSuccess();
      }

      // Show success toast notification
      toast.success(`PEC inviata per ${selectedUIDs.length} formulario${selectedUIDs.length > 1 ? 'i' : ''} con successo`);
    } catch (error) {
      console.error("Error sending PEC:", error);
      // Show error toast notification
      toast.error("Errore durante l'invio della PEC");
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (!isSending) {
      onOpenChange(false);
    }
  };

  /**
   * Get unique PEC recipients from formularios
   */
  const getUniqueRecipients = () => {
    const recipients = new Set<string>();
    formulariToSend.forEach(formulario => {
      try {
        const datiInvioPec = formulario.dati_invio_pec as DatiInvioPec;
        if (datiInvioPec?.pec_destinatario) {
          recipients.add(datiInvioPec.pec_destinatario);
        }
      } catch (error) {
        console.error("Error parsing dati_invio_pec:", error);
      }
    });
    return Array.from(recipients);
  };

  /**
   * Get documents that will be sent
   */
  const getDocumentsToSend = () => {
    const documents = new Set<string>();
    formulariToSend.forEach(formulario => {
      try {
        const datiInvioPec = formulario.dati_invio_pec as DatiInvioPec;
        if (datiInvioPec?.riceveFormulario) {
          documents.add("Formulario");
        }
        if (datiInvioPec?.riceveScontrino) {
          documents.add("Scontrino");
        }
      } catch (error) {
        console.error("Error parsing dati_invio_pec:", error);
      }
    });
    return Array.from(documents);
  };

  const recipients = getUniqueRecipients();
  const documentsToSend = getDocumentsToSend();

  // Check if any formulario has missing PEC data
  const hasInvalidPecData = formulariToSend.some(formulario => {
    try {
      const datiInvioPec = formulario.dati_invio_pec as DatiInvioPec;
      return !datiInvioPec?.pec_destinatario;
    } catch {
      return true;
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Conferma invio PEC
          </DialogTitle>
          <DialogDescription>
            Stai per inviare una PEC per {formulariToSend.length} formulario{formulariToSend.length > 1 ? 'i' : ''}.
            Verifica i dettagli prima di procedere.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* PEC Recipients */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Destinatari PEC:
            </h4>
            <div className="border rounded p-3 bg-muted/50">
              {recipients.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {recipients.map((recipient, index) => (
                    <li key={index} className="font-mono text-blue-600">
                      {recipient}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-destructive">Nessun destinatario PEC configurato</p>
              )}
            </div>
          </div>

          {/* Documents to send */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documenti da inviare:
            </h4>
            <div className="border rounded p-3 bg-muted/50">
              {documentsToSend.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {documentsToSend.map((document, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {document === "Formulario" ? (
                        <FileText className="h-3 w-3" />
                      ) : (
                        <Receipt className="h-3 w-3" />
                      )}
                      {document}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nessun documento selezionato</p>
              )}
            </div>
          </div>

          {/* Formularios list */}
          <div>
            <h4 className="text-sm font-medium mb-2">Formulari selezionati:</h4>
            <div className="max-h-32 overflow-y-auto border rounded p-2">
              <ul className="text-sm space-y-1">
                {formulariToSend.map((formulario, index) => (
                  <li key={index} className="text-muted-foreground flex justify-between items-center">
                    <span>{formulario.codice}</span>
                    {(() => {
                      try {
                        const datiInvioPec = formulario.dati_invio_pec as DatiInvioPec;
                        return !datiInvioPec?.pec_destinatario ? (
                          <Badge variant="destructive" className="text-xs">
                            PEC mancante
                          </Badge>
                        ) : null;
                      } catch {
                        return (
                          <Badge variant="destructive" className="text-xs">
                            Dati non validi
                          </Badge>
                        );
                      }
                    })()}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Warning for invalid data */}
          {hasInvalidPecData && (
            <div className="p-3 border border-destructive/20 bg-destructive/5 rounded">
              <p className="text-sm text-destructive">
                ⚠️ Alcuni formulari non hanno un destinatario PEC configurato. 
                L'invio potrebbe non riuscire per questi elementi.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            Annulla
          </Button>
          <Button
            onClick={executeSendPec}
            disabled={isSending || recipients.length === 0}
            className="flex items-center gap-2"
          >
            {isSending ? (
              "Inviando..."
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Invia PEC
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}