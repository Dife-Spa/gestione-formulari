import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		
		const response = await fetch('http://192.168.1.41:8021/cancella', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		
		if (!response.ok) {
			throw new Error(`API call failed with status: ${response.status}`);
		}
		
		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error in delete-formulario API:', error);
		return NextResponse.json(
			{ error: 'Failed to delete formulario' },
			{ status: 500 }
		);
	}
}