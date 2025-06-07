import { supabase } from "./supabase";
import type {
  CreateSupportTicket,
  SupportTicketFromDB,
} from "@/types/database.types";

/**
 * Service for handling support ticket operations
 */
export class SupportService {
  /**
   * Create a new support ticket
   */
  static async createTicket(
    ticketData: CreateSupportTicket
  ): Promise<SupportTicketFromDB> {
    try {
      const { data, error } = await supabase
        .from("formulari_tickets")
        .insert([
          {
            user_name: ticketData.user_name,
            inquiry_type: ticketData.inquiry_type,
            problem_title: ticketData.problem_title,
            problem_description: ticketData.problem_description,
            screenshot_url: ticketData.screenshot_url || null,
            screenshot_filename: ticketData.screenshot_filename || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating support ticket:", error);
        throw new Error(
          `Errore durante la creazione del ticket: ${error.message}`
        );
      }

      return data;
    } catch (error) {
      console.error("Support service error:", error);
      throw error;
    }
  }

  /**
   * Upload screenshot to Supabase Storage
   */
  static async uploadScreenshot(
    file: File,
    ticketId?: string
  ): Promise<{ url: string; filename: string }> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${ticketId || "temp"}.${fileExt}`;
      const filePath = `support-screenshots/${fileName}`;

      const { data, error } = await supabase.storage
        .from("support-files") // Make sure this bucket exists in Supabase
        .upload(filePath, file);

      if (error) {
        console.error("Error uploading screenshot:", error);
        throw new Error(
          `Errore durante l'upload dello screenshot: ${error.message}`
        );
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("support-files").getPublicUrl(filePath);

      return {
        url: publicUrl,
        filename: fileName,
      };
    } catch (error) {
      console.error("Screenshot upload error:", error);
      throw error;
    }
  }

  /**
   * Get all support tickets (for admin use)
   */
  static async getAllTickets(): Promise<SupportTicketFromDB[]> {
    try {
      const { data, error } = await supabase
        .from("formulari_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching support tickets:", error);
        throw new Error(
          `Errore durante il recupero dei ticket: ${error.message}`
        );
      }

      return data || [];
    } catch (error) {
      console.error("Support service error:", error);
      throw error;
    }
  }

  /**
   * Update ticket resolution status
   */
  static async resolveTicket(ticketId: number): Promise<SupportTicketFromDB> {
    try {
      const { data, error } = await supabase
        .from("formulari_tickets")
        .update({
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId)
        .select()
        .single();

      if (error) {
        console.error("Error resolving support ticket:", error);
        throw new Error(
          `Errore durante la risoluzione del ticket: ${error.message}`
        );
      }

      return data;
    } catch (error) {
      console.error("Support service error:", error);
      throw error;
    }
  }
}
