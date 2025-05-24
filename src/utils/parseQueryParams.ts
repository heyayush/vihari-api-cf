// src/utils/parseQueryParams.ts

export const parseQueryParams = (url: URL): Map<string, string> => {
	const params = new Map<string, string>();
	url.searchParams.forEach((value, key) => {
		params.set(key, value);
	});
	return params;
};
