import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to proxy formulario update requests to the external API server
 * This avoids CORS issues when calling the external API directly from the browser
 */
export async function POST(request: NextRequest) {
	try {
		// Get form data from the request
		const formData = await request.formData();
		const uid = formData.get('uid');
		const new_fir = formData.get('new_fir');
		const new_appuntamento = formData.get('new_appuntamento');
		
		// Validate required fields - either new_fir or new_appuntamento must be provided
		if (!uid || (!new_fir && !new_appuntamento)) {
			return NextResponse.json(
				{ error: 'uid and either new_fir or new_appuntamento are required fields' },
				{ status: 400 }
			);
		}

		// Create a new FormData object to forward to the external API
		const externalFormData = new FormData();
		externalFormData.append('uid', uid.toString());
		
		// Add the appropriate parameter based on what was provided
		if (new_fir) {
			externalFormData.append('new_fir', new_fir.toString());
		}
		if (new_appuntamento) {
			externalFormData.append('new_appuntamento', new_appuntamento.toString());
		}

		// Forward the request to the external API server
		const externalApiUrl = 'http://192.168.1.41:8020/aggiorna';
		
		console.log('Proxying formulario update request to:', externalApiUrl, {
			uid,
			new_fir,
			new_appuntamento
		});

		const response = await fetch(externalApiUrl, {
			method: 'POST',
			body: externalFormData,
		});

		if (!response.ok) {
			console.error('External API error:', response.status, response.statusText);
			return NextResponse.json(
				{ error: `External API error: ${response.status} ${response.statusText}` },
				{ status: response.status }
			);
		}

		// Try to parse as JSON first, fall back to text if that fails
		let result;
		try {
			result = await response.json();
		} catch (e) {
			result = { message: await response.text() };
		}

		console.log('Formulario updated successfully:', result);

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error in aggiorna-formulario API route:', error);
		
		// Handle network errors (e.g., external API server not reachable)
		if (error instanceof TypeError && error.message.includes('fetch')) {
			return NextResponse.json(
				{ error: 'Unable to connect to update service. Please check if the service is running.' },
				{ status: 503 }
			);
		}

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}