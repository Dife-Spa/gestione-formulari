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

interface DeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formulariToDelete: FormularioUI[];
  onDeleteSuccess?: () => void;
}

/**
 * Reusable deletion confirmation dialog for formularios
 * Displays the number of forms to be deleted and their codice values
 * Handles the API call for deletion with proper error handling
 */
export function DeletionDialog({
  open,
  onOpenChange,
  formulariToDelete,
  onDeleteSuccess,
}: DeletionDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  /**
   * Execute the deletion API call
   */
  const executeDelete = async () => {
    if (formulariToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      const selectedUIDs = formulariToDelete.map(formulario => formulario.uid);
      
      // Call the API to delete the selected formularios
      const response = await fetch("/api/delete-formulario", {
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
        `${selectedUIDs.length} formulario${selectedUIDs.length > 1 ? 'i' : ''} eliminato${selectedUIDs.length > 1 ? 'i' : ''} con successo`
      );

      // Close dialog
      onOpenChange(false);

      // Call success callback
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      // Show success toast notification
      toast.success(`${selectedUIDs.length} formulario${selectedUIDs.length > 1 ? 'i' : ''} eliminato${selectedUIDs.length > 1 ? 'i' : ''} con successo`);
    } catch (error) {
      console.error("Error deleting formularios:", error);
      // Show error toast notification
      toast.error("Errore durante l'eliminazione del formulario");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Conferma eliminazione</DialogTitle>
          <DialogDescription>
            Stai per eliminare {formulariToDelete.length} formulario{formulariToDelete.length > 1 ? 'i' : ''}.
            Questa azione non può essere annullata.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="text-sm font-medium mb-2">Formulari da eliminare:</h4>
          <div className="max-h-32 overflow-y-auto border rounded p-2">
            <ul className="text-sm space-y-1">
              {formulariToDelete.map((formulario, index) => (
                <li key={index} className="text-muted-foreground">
                  {formulario.codice}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Annulla
          </Button>
          <Button
            variant="destructive"
            onClick={executeDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Conferma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}