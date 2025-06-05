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
		data: dbRecord.data_emissione || dbRecord.created_at,
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
	searchColumn = '' // Add this parameter
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
	searchColumn?: string // Add this parameter
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
					// PEC sent: risultati_invio_pec is not null AND contains status_code = 200
					query = query
						.not('risultati_invio_pec', 'is', null)
						.eq('risultati_invio_pec->status_code', 200)
					break
				case 'non_inviata':
					// PEC not sent: risultati_invio_pec is null OR status_code != 200
					query = query.or('risultati_invio_pec.is.null,risultati_invio_pec->status_code.neq.200')
					break
			}
		}

		// Apply pagination
		const from = (page - 1) * pageSize
		const to = from + pageSize - 1
		query = query.range(from, to)

		// Apply date range filter
		if (dateFrom) {
		  query = query.gte('data_emissione', dateFrom)
		  
		  if (dateTo) {
		    // Add one day to include the end date in the range (since dates are stored as YYYY-MM-DD)
		    const nextDay = new Date(dateTo)
		    nextDay.setDate(nextDay.getDate() + 1)
		    const formattedNextDay = nextDay.toISOString().split('T')[0]
		    query = query.lt('data_emissione', formattedNextDay)
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