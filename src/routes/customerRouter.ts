// src/routes/customerRouter.ts
import { jsonResponse, parseQueryParams } from '../utils';
import { Env, CustomerInput } from '../types';
import {
	createCustomer,
	getCustomerDetails,
	listCustomers,
	updateCustomer,
	softDeleteCustomer,
	hardDeleteCustomer,
} from '../services/customerService';
import { BASE, DEFAULT_LIMIT, MAX_LIMIT } from '../CONFIG';

// Functional approach for handling requests
type RouterHandler = (request: Request, env: Env) => Promise<Response | null>;

const handleRouteErrors =
	(fn: RouterHandler): RouterHandler =>
	async (request: Request, env: Env): Promise<Response | null> => {
		try {
			return await fn(request, env);
		} catch (error) {
			console.error('Customer Router Error:', error);
			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
			return jsonResponse({ error: errorMessage }, 500);
		}
	};

const handleGetCustomerRoute: RouterHandler = handleRouteErrors(async (request, env) => {
	const url = new URL(request.url);
	const id = parseInt(url.pathname.replace(`${BASE}/customers/`, ''), 10);

	if (isNaN(id)) {
		return jsonResponse({ error: 'Invalid customer ID' }, 400);
	}

	const customer = await getCustomerDetails(env, id);

	if (!customer) {
		return jsonResponse({ error: 'Customer not found or already deleted' }, 404);
	}

	return jsonResponse(customer);
});

const handleListCustomersRoute: RouterHandler = handleRouteErrors(async (request, env) => {
	const url = new URL(request.url);
	const queryParams = parseQueryParams(url);

	let limit = parseInt(queryParams.get('limit') || DEFAULT_LIMIT.toString(), 10);
	let offset = parseInt(queryParams.get('offset') || '0', 10);

	// Apply MAX_LIMIT
	if (limit > MAX_LIMIT) {
		limit = MAX_LIMIT;
	}

	// Validate limit and offset
	if (isNaN(limit) || limit < 1 || isNaN(offset) || offset < 0) {
		return jsonResponse({ error: 'Invalid limit or offset parameters. Limit must be >= 1, Offset must be >= 0.' }, 400);
	}

	const customers = await listCustomers(env, limit, offset, queryParams.get('search') || '');
	return jsonResponse(customers);
});

const handleCreateCustomerRoute: RouterHandler = handleRouteErrors(async (request, env) => {
	const customerInput: CustomerInput = await request.json();
	const newCustomer = await createCustomer(env, customerInput);
	return jsonResponse(newCustomer, 201);
});

const handleUpdateCustomerRoute: RouterHandler = handleRouteErrors(async (request, env) => {
	const url = new URL(request.url);
	const id = parseInt(url.pathname.replace(`${BASE}/customers/`, ''), 10);

	if (isNaN(id)) {
		return jsonResponse({ error: 'Invalid customer ID' }, 400);
	}

	const updates: Partial<CustomerInput> = await request.json();

	// Ensure there's at least one field to update
	if (Object.keys(updates).length === 0) {
		return jsonResponse({ error: 'No update fields provided' }, 400);
	}

	const updatedCustomer = await updateCustomer(env, id, updates);

	if (!updatedCustomer) {
		return jsonResponse({ error: 'Customer not found or could not be updated' }, 404);
	}

	return jsonResponse(updatedCustomer);
});

const handleSoftDeleteCustomerRoute: RouterHandler = handleRouteErrors(async (request, env) => {
	const url = new URL(request.url);
	const id = parseInt(url.pathname.replace(`${BASE}/customers/`, ''), 10);

	if (isNaN(id)) {
		return jsonResponse({ error: 'Invalid customer ID' }, 400);
	}

	const success = await softDeleteCustomer(env, id);

	if (!success) {
		return jsonResponse({ error: 'Customer not found or could not be soft-deleted' }, 404);
	}

	return jsonResponse({ message: `Customer with ID ${id} soft-deleted successfully.` });
});

const handleHardDeleteCustomerRoute: RouterHandler = handleRouteErrors(async (request, env) => {
	const url = new URL(request.url);
	const id = parseInt(url.pathname.replace(`${BASE}/customers/`, ''), 10);

	if (isNaN(id)) {
		return jsonResponse({ error: 'Invalid customer ID' }, 400);
	}

	const success = await hardDeleteCustomer(env, id);

	if (!success) {
		return jsonResponse({ error: 'Customer not found or could not be hard-deleted' }, 404);
	}

	return jsonResponse({ message: `Customer with ID ${id} hard-deleted successfully.` });
});

// Main customer router function
export const customerRouter = async (request: Request, env: Env): Promise<Response | null> => {
	const url = new URL(request.url);
	const path = url.pathname;
	const method = request.method;

	// Remove the base path for internal routing
	const subPath = path.substring(BASE.length);

	// Route /customers/:id or /customers
	const customerIdMatch = subPath.match(/^\/customers\/(\d+)$/);

	if (customerIdMatch) {
		// Specific customer operations
		if (method === 'GET') {
			return handleGetCustomerRoute(request, env);
		} else if (method === 'PATCH') {
			return handleUpdateCustomerRoute(request, env);
		} else if (method === 'DELETE') {
			const action = url.searchParams.get('action');
			if (action === 'hard') {
				return handleHardDeleteCustomerRoute(request, env);
			}
			return handleSoftDeleteCustomerRoute(request, env); // Default to soft delete
		}
	} else if (subPath === '/customers') {
		// List or create customers
		if (method === 'GET') {
			return handleListCustomersRoute(request, env);
		} else if (method === 'POST') {
			return handleCreateCustomerRoute(request, env);
		}
	}

	// If no customer route matches, return null to let the main router handle it
	return null;
};
