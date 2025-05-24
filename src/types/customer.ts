// src/types/customer.ts

export interface Customer {
	id: number;
	project_id: string;
	name: string;
	address: string | null;
	phone: string | null;
	aadhar: string | null;
	email: string | null;
	is_deleted: number;
	created_at: string;
	updated_at: string;
}

export interface CustomerInput {
	project_id: string;
	name: string;
	address?: string;
	phone?: string;
	aadhar?: string;
	email?: string;
}
