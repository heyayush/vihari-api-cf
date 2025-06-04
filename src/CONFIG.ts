// src/CONFIG.ts
export const BASE = '/api'; // Or whatever base path you prefer for your API

// Define allowed origins for CORS. Use '*' for all origins (not recommended for production).
// Example: ['https://your-frontend-domain.com', 'http://localhost:3000']
export const ALLOWED_ORIGINS: string[] = [
	'http://localhost:5173', // Example for local frontend development
	'https://sharma-properties.netlify.app', // Replace with your actual frontend domain
	// Add more allowed origins as needed
];

// Define allowed HTTP methods for CORS preflight (OPTIONS)
export const ALLOWED_METHODS = 'GET,POST,PUT,DELETE,PATCH,OPTIONS';

// Define allowed HTTP headers for CORS preflight
export const ALLOWED_HEADERS = 'Content-Type,Authorization';

// Define how long the results of a preflight request can be cached (in seconds)
export const MAX_AGE_SECONDS = 86400; // 24 hours

// Pagination constants
export const DEFAULT_LIMIT = 10; // Default number of items per page
export const MAX_LIMIT = 50; // Maximum allowed limit for pagination
