// src/db/customerQueries.ts
import { Customer, CustomerInput, PaginatedResult } from '../types';

// Helper for D1 errors
const handleD1Error = (error: unknown, message: string) => {
	console.error(`D1 Error: ${message}`, error);
	if (error instanceof Error) {
		throw new Error(`${message}: ${error.message}`);
	}
	throw new Error(`${message}: An unknown D1 error occurred.`);
};

// --- Customer CRUD Operations Directly Executing D1 Queries ---

export const insertCustomer = async (db: D1Database, customer: CustomerInput): Promise<Customer> => {
	try {
		const stmt = db.prepare(
			`INSERT INTO customers (project_id, name, address, phone, aadhar, email)
             VALUES (?, ?, ?, ?, ?, ?)`
		);
		const result = await stmt
			.bind(
				customer.project_id,
				customer.name,
				customer.address || null,
				customer.phone || null,
				customer.aadhar || null,
				customer.email || null
			)
			.run();

		if (!result.success) {
			throw new Error('Failed to insert customer.');
		}

		// D1 doesn't directly return the inserted row with ID, so we fetch it
		const newCustomer = await db.prepare('SELECT * FROM customers WHERE rowid = ?').bind(result.meta.last_row_id).first<Customer>();

		if (!newCustomer) {
			throw new Error('Failed to retrieve newly created customer.');
		}
		return newCustomer;
	} catch (error) {
		handleD1Error(error, 'Error executing insertCustomer query');
		throw error;
	}
};

export const fetchCustomerById = async (db: D1Database, id: number): Promise<Customer | null> => {
	try {
		const stmt = db.prepare('SELECT * FROM customers WHERE id = ? AND is_deleted = 0');
		return await stmt.bind(id).first<Customer>();
	} catch (error) {
		handleD1Error(error, `Error executing fetchCustomerById query for ID ${id}`);
		throw error;
	}
};

export const fetchCustomers = async (
	db: D1Database,
	page: number = 1,
	limit: number = 10,
	searchTerm: string = ''
): Promise<PaginatedResult<Customer>> => {
	try {
		const offset = (page - 1) * limit;
		let query = 'SELECT * FROM customers WHERE is_deleted = 0';
		let countQuery = 'SELECT COUNT(*) as total_items FROM customers WHERE is_deleted = 0';
		const params: (string | number)[] = [];

		if (searchTerm) {
			const searchPattern = `%${searchTerm}%`;
			query += ' AND (name LIKE ? OR email LIKE ? OR project_id LIKE ?)';
			countQuery += ' AND (name LIKE ? OR email LIKE ? OR project_id LIKE ?)';
			params.push(searchPattern, searchPattern, searchPattern);
		}

		query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
		params.push(limit, offset);

		const [customersResult, totalItemsResult] = await Promise.all([
			db
				.prepare(query)
				.bind(...params)
				.all<Customer>(),
			db
				.prepare(countQuery)
				.bind(...params.slice(0, params.length - 2))
				.first<{ total_items: number }>(), // Remove limit/offset for count query
		]);

		const customers = customersResult.results || [];
		const totalItems = totalItemsResult ? totalItemsResult.total_items : 0;
		const totalPages = Math.ceil(totalItems / limit);

		return {
			data: customers,
			page,
			limit,
			total_items: totalItems,
			total_pages: totalPages,
		};
	} catch (error) {
		handleD1Error(error, 'Error executing fetchCustomers query');
		throw error;
	}
};

export const updateCustomerData = async (db: D1Database, id: number, updates: Partial<CustomerInput>): Promise<boolean> => {
	try {
		const fields: string[] = [];
		const params: (string | number)[] = [];

		console.log('updates:', updates);

		for (const key in updates) {
			if (Object.prototype.hasOwnProperty.call(updates, key) && key !== 'id' && key !== 'created_at' && key !== 'is_deleted') {
				fields.push(`${key} = ?`);
				params.push((updates as any)[key]);
			}
		}

		if (fields.length === 0) {
			return false; // No updates provided
		}

		fields.push('updated_at = CURRENT_TIMESTAMP');
		params.push(id); // ID is the last parameter for WHERE clause

		console.log('fields:', JSON.stringify(fields));
		console.log('params:', JSON.stringify(params));

		console.log(`Executing updateCustomerData => UPDATE customers SET ${fields.join(', ')} WHERE id = ? AND is_deleted = 0`);

		const stmt = db.prepare(`UPDATE customers SET ${fields.join(', ')} WHERE id = ? AND is_deleted = 0`);
		const { success } = await stmt.bind(...params).run();
		return success;
	} catch (error) {
		handleD1Error(error, `Error executing updateCustomerData query for ID ${id}`);
		throw error;
	}
};

export const softDeleteCustomerQuery = async (db: D1Database, id: number): Promise<boolean> => {
	try {
		const stmt = db.prepare('UPDATE customers SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
		const { success } = await stmt.bind(id).run();
		return success;
	} catch (error) {
		handleD1Error(error, `Error executing softDeleteCustomerQuery for ID ${id}`);
		throw error;
	}
};

export const hardDeleteCustomerQuery = async (db: D1Database, id: number): Promise<boolean> => {
	try {
		const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
		const { success } = await stmt.bind(id).run();
		return success;
	} catch (error) {
		handleD1Error(error, `Error executing hardDeleteCustomerQuery for ID ${id}`);
		throw error;
	}
};
