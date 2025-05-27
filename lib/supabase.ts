import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for the formulari table based on the database schema
export type FormularioFromDB = {
  id: number;
  created_at: string;
  numeroFir: string | null;
  file_paths: any | null;
  marcaGestito: string | null;
  gestito: boolean | null;
  id_elaborazione: string | null;
  uid: string;
  id_appuntamento: string | null;
  produttore: string | null;
  unita_locale_produttore: string | null;
  destinatario: string | null;
  unita_locale_destinatario: string | null;
  trasportatore: string | null;
  intermediario: string | null;
  dati_formulario: any | null;
  dati_accettazione: any | null;
  duplicati: any | null;
  data_emissione: string | null;
  dati_appuntamento: any | null;
  dati_invio_pec: any | null;
  dati_invio_bubble: any | null;
  script_code: string | null;
  data_movimento: string | null;
  risultati_invio_pec: any | null;
  dati_invio_buono: any | null;
};