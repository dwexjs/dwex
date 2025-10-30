import type { RequestMethod } from "@dwex/common";

/**
 * Route information exposed via MCP
 */
export interface McpRouteInfo {
	path: string;
	method: RequestMethod;
	controller: string;
	handler: string;
	guards: string[];
	interceptors: string[];
	params: McpRouteParam[];
	metadata?: Record<string, unknown>;
}

/**
 * Route parameter information
 */
export interface McpRouteParam {
	type: string;
	index: number;
	data?: string | symbol;
}

/**
 * Service information exposed via MCP
 */
export interface McpServiceInfo {
	token: string;
	name: string;
	scope: "SINGLETON" | "REQUEST" | "TRANSIENT";
	isGlobal: boolean;
	dependencies: string[];
	metadata?: Record<string, unknown>;
}

/**
 * Middleware information exposed via MCP
 */
export interface McpMiddlewareInfo {
	name: string;
	type: "global" | "controller";
	controller?: string;
	metadata?: Record<string, unknown>;
}

/**
 * Log entry in the buffer
 */
export interface McpLogEntry {
	timestamp: string;
	level: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
	message: string;
	context?: string;
	data?: unknown;
}

/**
 * Dependency graph node
 */
export interface McpDependencyNode {
	token: string;
	name: string;
	scope: "SINGLETON" | "REQUEST" | "TRANSIENT";
	dependencies: string[];
	dependents: string[];
}

/**
 * Application health status
 */
export interface McpHealthStatus {
	status: "healthy" | "degraded" | "unhealthy";
	uptime: number;
	timestamp: string;
	routes: number;
	services: number;
	middlewares: number;
}
