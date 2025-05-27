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

	return {
		id: dbRecord.id.toString(),
		codice: dbRecord.numeroFir || `FIR-${dbRecord.id}`,
		data: dbRecord.data_emissione || dbRecord.created_at,
		produttore: dbRecord.produttore || 'N/A',
		trasportatore: dbRecord.trasportatore || 'N/A',
		destinatario: dbRecord.destinatario || 'N/A',
		quantita,
		stato,
	}
}

/**
 * Fetch formulari with pagination and filtering
 */
export async function getFormulari({
	page = 1,
	pageSize = 10,
	search = '',
	status = '',
	sortBy = 'created_at',
	sortOrder = 'desc'
}: {
	page?: number
	pageSize?: number
	search?: string
	status?: string
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
} = {}) {
	const supabase = await createServerSupabaseClient()
	
	try {
		let query = supabase
			.from('formulari')
			.select('*', { count: 'exact' })
			.order(sortBy, { ascending: sortOrder === 'asc' })

		// Apply search filter
		if (search) {
			query = query.or(`numeroFir.ilike.%${search}%,produttore.ilike.%${search}%`)
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

		// Apply pagination
		const from = (page - 1) * pageSize
		const to = from + pageSize - 1
		query = query.range(from, to)

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