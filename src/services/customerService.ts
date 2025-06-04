// src/services/customerService.ts
import { Env, Customer, CustomerInput, PaginatedResult } from '../types';
import {
	insertCustomer,
	fetchCustomerById,
	fetchCustomers,
	updateCustomerData,
	softDeleteCustomerQuery,
	hardDeleteCustomerQuery,
} from '../db/customerQueries';

const handleServiceError = (error: unknown, message: string) => {
	console.error(`Service Error: ${message}`, error);
	if (error instanceof Error) {
		throw new Error(`${message}: ${error.message}`);
	}
	throw new Error(`${message}: An unknown error occurred.`);
};

export const createCustomer = async (env: Env, customerInput: CustomerInput): Promise<Customer> => {
	try {
		// Basic business validation (can be more complex)
		if (!customerInput.project_id || !customerInput.name) {
			throw new Error('Project ID and name are required.');
		}
		// Add more validation logic here (e.g., email format, Aadhar uniqueness before insert)

		return await insertCustomer(env.DB, customerInput);
	} catch (error) {
		handleServiceError(error, 'Failed to create customer');
		throw error;
	}
};

export const getCustomerDetails = async (env: Env, id: number): Promise<Customer | null> => {
	try {
		if (isNaN(id) || id <= 0) {
			throw new Error('Invalid customer ID provided.');
		}
		return await fetchCustomerById(env.DB, id);
	} catch (error) {
		handleServiceError(error, `Failed to retrieve customer details for ID ${id}`);
		throw error;
	}
};

export const listCustomers = async (env: Env, limit: number, offset: number, searchTerm: string): Promise<PaginatedResult<Customer>> => {
	try {
		if (isNaN(limit) || limit < 1 || isNaN(offset) || offset < 0) {
			throw new Error('Invalid limit or offset parameters.');
		}
		return await fetchCustomers(env.DB, limit, offset, searchTerm);
	} catch (error) {
		handleServiceError(error, 'Failed to list customers');
		throw error;
	}
};

export const updateCustomer = async (env: Env, id: number, updates: Partial<CustomerInput>): Promise<Customer | null> => {
	try {
		if (isNaN(id) || id <= 0) {
			throw new Error('Invalid customer ID provided.');
		}
		if (Object.keys(updates).length === 0) {
			// If no updates, return current customer details
			return await getCustomerDetails(env, id);
		}

		// Business logic for updates, e.g., Aadhar/Email uniqueness check if they are being updated
		if (updates.aadhar) {
			// Check if Aadhar is already taken by another customer
			// This would require a new query in customerQueries.ts
		}
		if (updates.email) {
			// Check if email is already taken
		}

		const success = await updateCustomerData(env.DB, id, updates);
		if (success) {
			return await getCustomerDetails(env, id); // Fetch the updated customer
		}
		return null;
	} catch (error) {
		handleServiceError(error, `Failed to update customer with ID ${id}`);
		throw error;
	}
};

export const softDeleteCustomer = async (env: Env, id: number): Promise<boolean> => {
	try {
		if (isNaN(id) || id <= 0) {
			throw new Error('Invalid customer ID provided.');
		}
		return await softDeleteCustomerQuery(env.DB, id);
	} catch (error) {
		handleServiceError(error, `Failed to soft delete customer with ID ${id}`);
		throw error;
	}
};

export const hardDeleteCustomer = async (env: Env, id: number): Promise<boolean> => {
	try {
		if (isNaN(id) || id <= 0) {
			throw new Error('Invalid customer ID provided.');
		}
		return await hardDeleteCustomerQuery(env.DB, id);
	} catch (error) {
		handleServiceError(error, `Failed to hard delete customer with ID ${id}`);
		throw error;
	}
};
