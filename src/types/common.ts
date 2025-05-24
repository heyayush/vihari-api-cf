// src/types/common.ts

export interface Env {
	DB: D1Database;
}

export interface PaginatedResult<T> {
	data: T[];
	page: number;
	limit: number;
	total_items: number;
	total_pages: number;
}
