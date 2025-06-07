"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { SupportService } from "@/lib/support-service";
import type { CreateSupportTicket } from "@/types/database.types";

interface SupportDialogProps {
  children: React.ReactNode;
}

const inquiryTypes = [
  "Domanda generale",
  "Richiesta funzionalità",
  "Bug report",
  "Altro",
];

export function SupportDialog({ children }: SupportDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    problem: "",
    problemDescription: "",
    inquiryType: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      let screenshotUrl: string | null = null;
      let screenshotFilename: string | null = null;

      // Upload screenshot if provided
      if (screenshot) {
        try {
          const uploadResult = await SupportService.uploadScreenshot(
            screenshot
          );
          screenshotUrl = uploadResult.url;
          screenshotFilename = uploadResult.filename;
        } catch (uploadError) {
          console.warn(
            "Screenshot upload failed, continuing without screenshot:",
            uploadError
          );
          // Continue without screenshot rather than failing the entire submission
        }
      }

      // Create ticket data
      const ticketData: CreateSupportTicket = {
        user_name: formData.userName.trim(),
        inquiry_type: formData.inquiryType,
        problem_title: formData.problem.trim(),
        problem_description: formData.problemDescription.trim(),
        screenshot_url: screenshotUrl,
        screenshot_filename: screenshotFilename,
      };

      // Submit ticket to Supabase
      const createdTicket = await SupportService.createTicket(ticketData);

      console.log("Support ticket created successfully:", createdTicket);

      // Reset form and show success
      setFormData({
        userName: "",
        problem: "",
        problemDescription: "",
        inquiryType: "",
      });
      setScreenshot(null);
      setSubmitStatus("success");

      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false);
        setSubmitStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Errore sconosciuto durante l'invio del ticket"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (only images)
      if (file.type.startsWith("image/")) {
        // Validate file size (max 10MB)
        if (file.size <= 10 * 1024 * 1024) {
          setScreenshot(file);
        } else {
          alert("Il file è troppo grande. Dimensione massima: 10MB");
          e.target.value = "";
        }
      } else {
        alert("Per favore seleziona solo file immagine (PNG, JPG, GIF, etc.)");
        e.target.value = "";
      }
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    // Reset file input
    const fileInput = document.getElementById("screenshot") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const isFormValid =
    formData.userName.trim() !== "" &&
    formData.problem.trim() !== "" &&
    formData.problemDescription.trim() !== "" &&
    formData.inquiryType !== "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Richiesta di Supporto</DialogTitle>
          <DialogDescription>
            Compila il modulo sottostante per inviare una richiesta di supporto.
            Ti risponderemo il prima possibile.
          </DialogDescription>
        </DialogHeader>

        {submitStatus === "success" && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Ticket di supporto inviato con successo!
            </span>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div className="text-sm text-red-800">
              <div className="font-medium">Errore durante l'invio</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName" className="gap-1">
              Nome Utente<span className="text-destructive">*</span>
            </Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => handleInputChange("userName", e.target.value)}
              placeholder="Inserisci il tuo nome"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label className="gap-1">
              Tipo di Richiesta<span className="text-destructive">*</span>
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  type="button"
                  disabled={isSubmitting}
                >
                  {formData.inquiryType || "Seleziona il tipo di richiesta"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {inquiryTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleInputChange("inquiryType", type)}
                  >
                    {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem" className="gap-1">
              Problema<span className="text-destructive">*</span>
            </Label>
            <Input
              id="problem"
              value={formData.problem}
              onChange={(e) => handleInputChange("problem", e.target.value)}
              placeholder="Riassumi brevemente il problema"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemDescription" className="gap-1">
              Descrizione del Problema{" "}
              <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="problemDescription"
              value={formData.problemDescription}
              onChange={(e) =>
                handleInputChange("problemDescription", e.target.value)
              }
              placeholder="Descrivi dettagliatamente il problema..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot (opzionale)</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      document.getElementById("screenshot")?.click()
                    }
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {screenshot ? screenshot.name : "Scegli file..."}
                  </Button>
                </div>
              </div>
              {screenshot && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm text-muted-foreground truncate">
                    {screenshot.name} ({Math.round(screenshot.size / 1024)} KB)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeScreenshot}
                    className="h-6 w-6 p-0"
                    disabled={isSubmitting}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Formati supportati: PNG, JPG, GIF, WebP (max 10MB)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !isFormValid || submitStatus === "success"
              }
            >
              {isSubmitting ? "Invio..." : "Invia Richiesta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
