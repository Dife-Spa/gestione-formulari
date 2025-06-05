import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to proxy PEC sending requests to the external API server
 * This avoids CORS issues when calling the external API directly from the browser
 */
export async function POST(request: NextRequest) {
	try {
		// Parse the request body
		const body = await request.json();
		
		// Validate that uid_array is provided
		if (!body.uid_array || !Array.isArray(body.uid_array)) {
			return NextResponse.json(
				{ error: 'uid_array is required and must be an array' },
				{ status: 400 }
			);
		}

		// Forward the request to the external API server
		const externalApiUrl = 'http://192.168.1.172:8022/api/send-pec';
		
		console.log('Proxying PEC request to:', externalApiUrl);
		console.log('Request body:', body);

		const response = await fetch(externalApiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			console.error('External API error:', response.status, response.statusText);
			return NextResponse.json(
				{ error: `External API error: ${response.status} ${response.statusText}` },
				{ status: response.status }
			);
		}

		const result = await response.json();
		console.log('PEC sent successfully:', result);

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error in send-pec API route:', error);
		
		// Handle network errors (e.g., external API server not reachable)
		if (error instanceof TypeError && error.message.includes('fetch')) {
			return NextResponse.json(
				{ error: 'Unable to connect to PEC service. Please check if the service is running.' },
				{ status: 503 }
			);
		}

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}