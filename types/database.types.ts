/**
 * Database types for Supabase formulari table
 */
export type FormularioFromDB = {
	id: number
	created_at: string
	numeroFir: string | null
	file_paths: any | null
	uid: string
	id_appuntamento: string | null
	produttore: string | null
	unita_locale_produttore: string | null
	destinatario: string | null
	unita_locale_destinatario: string | null
	trasportatore: string | null
	intermediario: string | null
	dati_formulario: any | null
	data_emissione: string | null
	dati_appuntamento: any | null
	dati_invio_pec: any | null
	data_movimento: string | null
	risultati_invio_pec: any | null
}

/**
 * Transformed type for the UI components
 */
export type FormularioUI = {
	id: string
	codice: string
	data: string
	produttore: string
	trasportatore: string
	destinatario: string
	quantita: number
	stato: "in_attesa" | "approvato" | "rifiutato" | "completato"
}