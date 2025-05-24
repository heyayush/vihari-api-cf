// src/utils/jsonResponse.ts

export const jsonResponse = <T>(data: T, status: number = 200, headers: HeadersInit = {}): Response => {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
	});
};
