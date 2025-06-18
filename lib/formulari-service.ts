import { createServerSupabaseClient } from './supabase-server'
import { FormularioFromDB, FormularioUI } from '@/types/database.types'

/**
 * Transform database record to UI format
 */
function transformFormularioForUI(dbRecord: FormularioFromDB): FormularioUI {
	// Extract quantity from dati_formulario JSON if available
	const quantita = dbRecord.dati_formulario?.quantita || 0
	
	// Determine status based on available data
	let stato: FormularioUI['stato'] = 'in_attesa'
	if (dbRecord.risultati_invio_pec) {
		stato = 'completato'
	} else if (dbRecord.data_movimento) {
		stato = 'approvato'
	}

	// Transform file paths to use Supabase storage URL
	const transformedFilePaths = dbRecord.file_paths ? {
		scontrino: dbRecord.file_paths.scontrino ? `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}${dbRecord.file_paths.scontrino}` : null,
		file_input: dbRecord.file_paths.file_input ? `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}${dbRecord.file_paths.file_input}` : null,
		formulario: dbRecord.file_paths.formulario ? `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}${dbRecord.file_paths.formulario}` : null,
		buono_intervento: dbRecord.file_paths.buono_intervento ? `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}${dbRecord.file_paths.buono_intervento}` : null
	} : null

	return {
		id: dbRecord.id.toString(),
		uid: dbRecord.uid,  // Add this line to include the uid
		codice: dbRecord.numeroFir || `FIR-${dbRecord.id}`,
		data: dbRecord.data_movimento || dbRecord.created_at,
		produttore: dbRecord.produttore || 'N/A',
		trasportatore: dbRecord.trasportatore || 'N/A',
		destinatario: dbRecord.destinatario || 'N/A',
		intermediario: dbRecord.intermediario || null,
		id_appuntamento: dbRecord.id_appuntamento,
		quantita,
		stato,
		file_paths: transformedFilePaths,
		dati_formulario: dbRecord.dati_formulario,
		dati_invio_pec: dbRecord.dati_invio_pec,
		dati_appuntamento: dbRecord.dati_appuntamento,
		unita_locale_produttore: dbRecord.unita_locale_produttore,
		unita_locale_destinatario: dbRecord.unita_locale_destinatario
	}
}

/**
 * Fetch formulari with pagination and filtering
 */
// Update the getFormulari function parameters
export async function getFormulari({
	page = 1,
	pageSize = 10,
	search = '',
	status = '',
	dateFrom = '',
	dateTo = '',
	sortBy = 'created_at',
	sortOrder = 'desc',
	documents = '',
	pecStatus = '',
	searchColumn = '',
	daGestireStatus = '',
	month = '' // Add this parameter
}: {
	page?: number
	pageSize?: number
	search?: string
	status?: string
	dateFrom?: string
	dateTo?: string
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
	documents?: string
	pecStatus?: string
	searchColumn?: string
	daGestireStatus?: string
	month?: string // Add this parameter
} = {}) {
	const supabase = await createServerSupabaseClient()
	
	try {
		let query = supabase
			.from('formulari')
			.select('*', { count: 'exact' })
			.order(sortBy, { ascending: sortOrder === 'asc' })

		// Apply search filter
		if (search) {
			if (searchColumn) {
				// Search in specific column
				switch (searchColumn) {
					case 'numeroFir':
						query = query.ilike('numeroFir', `%${search}%`)
						break
					case 'produttore':
						query = query.ilike('produttore', `%${search}%`)
						break
					case 'trasportatore':
						query = query.ilike('trasportatore', `%${search}%`)
						break
					case 'destinatario':
						query = query.ilike('destinatario', `%${search}%`)
						break
					case 'intermediario':
						query = query.ilike('intermediario', `%${search}%`)
						break
					default:
						// If searchColumn is invalid, fall back to searching all columns
						query = query.or(`numeroFir.ilike.%${search}%,produttore.ilike.%${search}%,trasportatore.ilike.%${search}%,destinatario.ilike.%${search}%,intermediario.ilike.%${search}%`)
				}
			} else {
				// Search in all columns (existing behavior)
				query = query.or(`numeroFir.ilike.%${search}%,produttore.ilike.%${search}%,trasportatore.ilike.%${search}%,destinatario.ilike.%${search}%,intermediario.ilike.%${search}%`)
			}
		}

		// Apply status filter
		if (status) {
			switch (status) {
				case 'completato':
					query = query.not('risultati_invio_pec', 'is', null)
					break
				case 'approvato':
					query = query.not('data_movimento', 'is', null).is('risultati_invio_pec', null)
					break
				case 'in_attesa':
					query = query.is('data_movimento', null)
					break
			}
		}

		// Apply documents filter
		if (documents) {
			const documentTypes = documents.split(',')
			
			// Apply each document type filter with AND logic
			if (documentTypes.length > 0) {
				documentTypes.forEach(docType => {
					query = query.not(`file_paths->>${docType}`, 'is', null)
				})
			}
		}

		// Add PEC status filter after the documents filter
		if (pecStatus) {
			switch (pecStatus) {
				case 'inviata':
					// PEC sent: risultati_invio_pec is not null
					query = query.not('risultati_invio_pec', 'is', null)
					break
				case 'non_inviata':
					// PEC not sent: risultati_invio_pec is null
					query = query.is('risultati_invio_pec', null)
					break
			}
		}

		// Add Da Gestire filter
		if (daGestireStatus === 'da_gestire') {
			// Filter for items where idTrasportatore equals "70577" and idProduttore is not "70577"
			// Using JSON operators to access fields within dati_appuntamento JSONB column
			query = query
				.eq('dati_appuntamento->>idTrasportatore', '70577')
				.neq('dati_appuntamento->>idProduttore', '70577')
		}
		

		// Add Month filter (after the Da Gestire filter)
		if (month) {
			// Extract year and month from the parameter (format: YYYY-MM)
			const [year, monthNum] = month.split('-')
			
			// Calculate the start and end dates for the selected month
			const startDate = `${year}-${monthNum}-01` // First day of month
			
			// Calculate last day of month
			const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate()
			const endDate = `${year}-${monthNum}-${lastDay}` // Last day of month
			
			// Filter by data_movimento within the month range
			query = query.gte('data_movimento', startDate)
				.lte('data_movimento', endDate)
		}

		// Apply pagination
		const from = (page - 1) * pageSize
		const to = from + pageSize - 1
		query = query.range(from, to)

		// Apply date range filter
		if (dateFrom) {
		  query = query.gte('data_movimento', dateFrom)
		  
		  if (dateTo) {
		    // Add one day to include the end date in the range (since dates are stored as YYYY-MM-DD)
		    const nextDay = new Date(dateTo)
		    nextDay.setDate(nextDay.getDate() + 1)
		    const formattedNextDay = nextDay.toISOString().split('T')[0]
		    query = query.lt('data_movimento', formattedNextDay)
		  }
		}

		const { data, error, count } = await query

		if (error) {
			console.error('Error fetching formulari:', error)
			throw new Error('Failed to fetch formulari')
		}

		const transformedData = data?.map(transformFormularioForUI) || []

		return {
			data: transformedData,
			total: count || 0,
			page,
			pageSize,
			totalPages: Math.ceil((count || 0) / pageSize)
		}
	} catch (error) {
		console.error('Error in getFormulari:', error)
		throw error
	}
}

/**
 * Get a single formulario by ID
 */
export async function getFormularioById(id: string): Promise<FormularioUI | null> {
	const supabase = await createServerSupabaseClient()
	
	try {
		const { data, error } = await supabase
			.from('formulari')
			.select('*')
			.eq('id', id)
			.single()

		if (error) {
			console.error('Error fetching formulario:', error)
			return null
		}

		return data ? transformFormularioForUI(data) : null
	} catch (error) {
		console.error('Error in getFormularioById:', error)
		return null
	}
}