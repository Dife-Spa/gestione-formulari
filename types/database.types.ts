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
	uid: string  // Add this line to include the uid property
	codice: string
	data: string
	produttore: string
	trasportatore: string
	destinatario: string
	intermediario: string | null
	quantita: number
	stato: "in_attesa" | "approvato" | "rifiutato" | "completato"
	id_appuntamento: string | null
	dati_formulario: any | null
	dati_invio_pec: any | null
	dati_appuntamento: any | null
	unita_locale_produttore: string | null
	unita_locale_destinatario: string | null
	file_paths: {
		scontrino: string | null
		file_input: string | null
		formulario: string | null
		buono_intervento: string | null
	} | null
}