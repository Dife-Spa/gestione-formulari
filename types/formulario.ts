/**
 * Type definition for a Formulario record
 */
export type Formulario = {
	id: string
	codice: string
	data: string
	produttore: string
	trasportatore: string
	destinazione: string
	quantita: number
	stato: "in_attesa" | "approvato" | "rifiutato" | "completato"
}

/**
 * Sample data for formulari
 */
export const formulari: Formulario[] = [
	{
		id: "f001",
		codice: "FIR-2023-001",
		data: "2023-01-15",
		produttore: "Azienda Alpha S.r.l.",
		trasportatore: "Trasporti Veloci S.p.A.",
		destinazione: "Impianto Smaltimento Nord",
		quantita: 1500,
		stato: "completato"
	},
	{
		id: "f002",
		codice: "FIR-2023-002",
		data: "2023-02-20",
		produttore: "Industria Beta S.r.l.",
		trasportatore: "Eco Trasporti S.r.l.",
		destinazione: "Centro Recupero Est",
		quantita: 800,
		stato: "approvato"
	},
	{
		id: "f003",
		codice: "FIR-2023-003",
		data: "2023-03-10",
		produttore: "Manifattura Gamma S.p.A.",
		trasportatore: "Trasporti Sicuri S.r.l.",
		destinazione: "Impianto Trattamento Sud",
		quantita: 2200,
		stato: "in_attesa"
	},
	{
		id: "f004",
		codice: "FIR-2023-004",
		data: "2023-04-05",
		produttore: "Azienda Delta S.r.l.",
		trasportatore: "Green Logistics S.p.A.",
		destinazione: "Centro Smaltimento Ovest",
		quantita: 1200,
		stato: "rifiutato"
	},
	{
		id: "f005",
		codice: "FIR-2023-005",
		data: "2023-05-18",
		produttore: "Industria Epsilon S.r.l.",
		trasportatore: "Trasporti Rapidi S.r.l.",
		destinazione: "Impianto Recupero Centrale",
		quantita: 950,
		stato: "completato"
	},
]