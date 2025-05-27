import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for server-side operations
 */
export const createServerSupabaseClient = async () => {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	const cookieStore = await cookies()

	return createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false
		},
		global: {
			headers: {
				Cookie: cookieStore.toString()
			}
		}
	})
}