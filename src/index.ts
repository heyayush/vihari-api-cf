// src/index.ts
import { BASE } from './CONFIG';
import { OPENAPI_YAML_CONTENT } from './openapi.yaml'; // Import OpenAPI content
import { Env } from './types'; // Import from the new types index
import { customerRouter } from './routes/customerRouter';
import { jsonResponse, addCORSHeaders, handleOptionsRequest } from './utils'; // Import from the new utils index

export default {
	async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(req.url);
		const pathname = url.pathname;
		let response: Response;

		// Handle OPTIONS preflight requests for all paths
		if (req.method === 'OPTIONS') {
			return handleOptionsRequest(req);
		}

		// Serve OpenAPI spec
		if (pathname === '/openapi.yaml') {
			response = new Response(OPENAPI_YAML_CONTENT, {
				headers: {
					'Content-Type': 'text/yaml',
				},
			});
			// Apply CORS headers to OpenAPI spec response as well
			return addCORSHeaders(req, response);
		}

		// Main API routing
		switch (true) {
			case pathname.startsWith(`${BASE}/customers`):
				response = (await customerRouter(req, env)) || jsonResponse({ error: 'Not Found' }, 404);
				break;

			// Add cases for other entities here:
			// case pathname.startsWith(`${BASE}/products`):
			//     response = await productsRouter(req, env);
			//     break;

			default:
				// If no specific router handled the request
				response = jsonResponse({ error: 'Not Found' }, 404);
				break;
		}

		// Apply CORS headers to all API responses before returning
		return addCORSHeaders(req, response);
	},
};
