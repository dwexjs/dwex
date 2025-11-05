import type { RequestMethod } from "@dwex/common";

/**
 * Route parameter metadata.
 */
export interface RouteParam {
	name: string;
	index: number;
}

/**
 * Route definition.
 */
export interface Route {
	path: string;
	method: RequestMethod;
	handler: Function;
	controller: any;
	params: RouteParam[];
	guards: any[];
	interceptors: any[];
}

/**
 * Parses a route path and extracts parameter names.
 *
 * @param path - The route path (e.g., '/users/:id/posts/:postId')
 * @returns Object with regex and param names
 */
export function parseRoutePath(path: string): {
	regex: RegExp;
	params: string[];
} {
	const params: string[] = [];

	// Normalize path
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	// Replace :param with regex capture groups
	const regexPath = normalizedPath.replace(/:([^/]+)/g, (match, paramName) => {
		params.push(paramName);
		return "([^/]+)";
	});

	// Create regex that matches the full path
	const regex = new RegExp(`^${regexPath}$`);

	return { regex, params };
}

/**
 * Extracts parameter values from a URL path.
 *
 * @param path - The URL path
 * @param routePath - The route path pattern
 * @returns Object with parameter values
 */
export function extractParams(
	path: string,
	routePath: string,
): Record<string, string> {
	const { regex, params: paramNames } = parseRoutePath(routePath);
	const match = path.match(regex);

	if (!match) {
		return {};
	}

	const params: Record<string, string> = {};
	paramNames.forEach((name, index) => {
		params[name] = match[index + 1];
	});

	return params;
}

/**
 * Extracts query parameters from a URL.
 *
 * @param url - The full URL
 * @returns Object with query parameter values
 */
export function extractQuery(url: string): Record<string, string> {
	const urlObj = new URL(url, "http://localhost");
	const query: Record<string, string> = {};

	urlObj.searchParams.forEach((value, key) => {
		query[key] = value;
	});

	return query;
}
