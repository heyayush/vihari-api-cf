// src/types/common.ts

export interface Env {
	DB: D1Database;
}

export interface PaginatedResult<T> {
	data: T[];
	count: number;
}
