// src/utils/cors.ts
import { ALLOWED_ORIGINS, ALLOWED_METHODS, ALLOWED_HEADERS, MAX_AGE_SECONDS } from '../CONFIG';

/**
 * Adds CORS headers to a Response object.
 * Handles both simple and preflight (OPTIONS) requests.
 */
export const addCORSHeaders = (request: Request, response: Response): Response => {
	const origin = request.headers.get('Origin');

	// If no Origin header, or if the origin is not allowed, or if ALLOWED_ORIGINS is empty (no restriction)
	if (!origin || (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin))) {
		// If an Origin header is present but not allowed, do not add CORS headers.
		// This effectively blocks the request if the browser enforces CORS.
		return response;
	}

	// Add Access-Control-Allow-Origin
	response.headers.set('Access-Control-Allow-Origin', origin);
	response.headers.set('Vary', 'Origin'); // Indicate that the response varies based on the Origin header

	// Handle preflight requests (OPTIONS method)
	if (request.method === 'OPTIONS') {
		response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
		response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
		response.headers.set('Access-Control-Max-Age', MAX_AGE_SECONDS.toString());
		// For preflight, status 204 No Content is often used if there's no actual body,
		// but here we might already have a response with a body from the router.
		// The important part is setting the headers.
		if (response.status === 404 || response.status === 500) {
			// If original handler returned error for OPTIONS, fix status
			response = new Response(null, {
				status: 204, // No Content for successful preflight
				headers: response.headers, // Preserve headers set above
			});
		}
	}

	// Allow credentials if needed (e.g., cookies, HTTP authentication)
	// response.headers.set('Access-Control-Allow-Credentials', 'true');

	return response;
};

/**
 * A utility function to handle OPTIONS requests for CORS preflight.
 * Returns a 204 No Content response with appropriate CORS headers.
 */
export const handleOptionsRequest = (request: Request): Response => {
	let response = new Response(null, { status: 204 }); // 204 No Content
	response = addCORSHeaders(request, response);
	return response;
};
