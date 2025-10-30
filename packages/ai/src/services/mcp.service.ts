import { Injectable } from "@dwex/core";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RequestMethod } from "@dwex/common";
import { IntrospectionService } from "./introspection.service.js";
import { LogBufferService } from "./log-buffer.service.js";

/**
 * Service for managing the MCP server instance and registering tools/resources
 */
@Injectable()
export class McpService {
	public readonly server: McpServer;

	constructor(
		private readonly introspection: IntrospectionService,
		private readonly logBuffer: LogBufferService,
	) {
		this.server = new McpServer({
			name: "dwex-mcp-server",
			version: "1.0.0",
		});

		this.registerTools();
		this.registerResources();
	}

	/**
	 * Register all MCP tools
	 */
	private registerTools(): void {
		// Tool 1: List all routes
		this.server.registerTool(
			"list_routes",
			{
				title: "List Routes",
				description: "List all registered routes in the Dwex application",
				inputSchema: {},
				outputSchema: {
					routes: z.array(
						z.object({
							path: z.string(),
							method: z.string(),
							controller: z.string(),
							handler: z.string(),
						}),
					),
					count: z.number(),
				},
			},
			async () => {
				const routes = this.introspection.getRoutes();
				const output = {
					routes: routes.map((r) => ({
						path: r.path,
						method: RequestMethod[r.method],
						controller: r.controller,
						handler: r.handler,
					})),
					count: routes.length,
				};
				return {
					content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
					structuredContent: output,
				};
			},
		);

		// Tool 2: Get route details
		this.server.registerTool(
			"get_route_details",
			{
				title: "Get Route Details",
				description: "Get detailed information about a specific route",
				inputSchema: {
					method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "ALL"]),
					path: z.string().describe("The route path"),
				},
				outputSchema: {
					route: z
						.object({
							path: z.string(),
							method: z.string(),
							controller: z.string(),
							handler: z.string(),
							guards: z.array(z.string()),
							interceptors: z.array(z.string()),
							params: z.array(z.any()),
							metadata: z.record(z.any()).optional(),
						})
						.nullable(),
				},
			},
			async ({ method, path }) => {
				const methodEnum = RequestMethod[method as keyof typeof RequestMethod];
				const route = this.introspection.getRouteDetails(methodEnum, path);
				const output = {
					route: route
						? {
								...route,
								method: RequestMethod[route.method],
							}
						: null,
				};
				return {
					content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
					structuredContent: output,
				};
			},
		);

		// Tool 3: List all services
		this.server.registerTool(
			"list_services",
			{
				title: "List Services",
				description: "List all services registered in the DI container",
				inputSchema: {},
				outputSchema: {
					services: z.array(
						z.object({
							token: z.string(),
							name: z.string(),
							scope: z.enum(["SINGLETON", "REQUEST", "TRANSIENT"]),
							isGlobal: z.boolean(),
						}),
					),
					count: z.number(),
				},
			},
			async () => {
				const services = this.introspection.getServices();
				const output = {
					services: services.map((s) => ({
						token: s.token,
						name: s.name,
						scope: s.scope,
						isGlobal: s.isGlobal,
					})),
					count: services.length,
				};
				return {
					content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
					structuredContent: output,
				};
			},
		);

		// Tool 4: Get service details
		this.server.registerTool(
			"get_service_details",
			{
				title: "Get Service Details",
				description: "Get detailed information about a specific service including dependencies",
				inputSchema: {
					token: z.string().describe("Service token or name"),
				},
				outputSchema: {
					service: z
						.object({
							token: z.string(),
							name: z.string(),
							scope: z.enum(["SINGLETON", "REQUEST", "TRANSIENT"]),
							isGlobal: z.boolean(),
							dependencies: z.array(z.string()),
							metadata: z.record(z.any()).optional(),
						})
						.nullable(),
				},
			},
			async ({ token }) => {
				const service = this.introspection.getServiceDetails(token);
				const output = { service };
				return {
					content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
					structuredContent: output,
				};
			},
		);

		// Tool 5: List middlewares
		this.server.registerTool(
			"list_middlewares",
			{
				title: "List Middlewares",
				description: "List all middlewares (global and controller-scoped)",
				inputSchema: {},
				outputSchema: {
					middlewares: z.array(
						z.object({
							name: z.string(),
							type: z.enum(["global", "controller"]),
							controller: z.string().optional(),
						}),
					),
					count: z.number(),
				},
			},
			async () => {
				const middlewares = this.introspection.getMiddlewares();
				const output = {
					middlewares: middlewares.map((m) => ({
						name: m.name,
						type: m.type,
						controller: m.controller,
					})),
					count: middlewares.length,
				};
				return {
					content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
					structuredContent: output,
				};
			},
		);

		// Tool 6: Get dependency graph
		this.server.registerTool(
			"get_dependency_graph",
			{
				title: "Get Dependency Graph",
				description: "Get the full dependency graph of all services",
				inputSchema: {},
				outputSchema: {
					nodes: z.array(
						z.object({
							token: z.string(),
							name: z.string(),
							scope: z.enum(["SINGLETON", "REQUEST", "TRANSIENT"]),
							dependencies: z.array(z.string()),
							dependents: z.array(z.string()),
						}),
					),
				},
			},
			async () => {
				const nodes = this.introspection.getDependencyGraph();
				const output = { nodes };
				return {
					content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
					structuredContent: output,
				};
			},
		);

		// Tool 7: Get logs
		this.server.registerTool(
			"get_logs",
			{
				title: "Get Logs",
				description: "Get recent logs from the application buffer",
				inputSchema: {
					level: z
						.enum(["trace", "debug", "info", "warn", "error", "fatal"])
						.optional()
						.describe("Filter by log level"),
					limit: z.number().optional().describe("Maximum number of logs to return"),
					since: z.string().optional().describe("ISO timestamp to filter logs from"),
				},
				outputSchema: {
					logs: z.array(
						z.object({
							timestamp: z.string(),
							level: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]),
							message: z.string(),
							context: z.string().optional(),
							data: z.any().optional(),
						}),
					),
					count: z.number(),
				},
			},
			async ({ level, limit, since }) => {
				const logs = this.logBuffer.getLogs({
					level,
					limit,
					since: since ? new Date(since) : undefined,
				});
				const output = {
					logs,
					count: logs.length,
				};
				return {
					content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
					structuredContent: output,
				};
			},
		);
	}

	/**
	 * Register all MCP resources
	 */
	private registerResources(): void {
		// Resource 1: Routes collection
		this.server.registerResource(
			"routes",
			new ResourceTemplate("dwex://routes", { list: undefined }),
			{
				title: "Routes Collection",
				description: "All registered routes in the application",
			},
			async (uri) => {
				const routes = this.introspection.getRoutes();
				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(routes, null, 2),
							mimeType: "application/json",
						},
					],
				};
			},
		);

		// Resource 2: Services collection
		this.server.registerResource(
			"services",
			new ResourceTemplate("dwex://services", { list: undefined }),
			{
				title: "Services Collection",
				description: "All services in the DI container",
			},
			async (uri) => {
				const services = this.introspection.getServices();
				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(services, null, 2),
							mimeType: "application/json",
						},
					],
				};
			},
		);

		// Resource 3: Logs collection
		this.server.registerResource(
			"logs",
			new ResourceTemplate("dwex://logs", { list: undefined }),
			{
				title: "Logs Collection",
				description: "Recent application logs",
			},
			async (uri) => {
				const logs = this.logBuffer.getLogs();
				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(logs, null, 2),
							mimeType: "application/json",
						},
					],
				};
			},
		);

		// Resource 4: Health status
		this.server.registerResource(
			"health",
			new ResourceTemplate("dwex://health", { list: undefined }),
			{
				title: "Health Status",
				description: "Application health and statistics",
			},
			async (uri) => {
				const health = this.introspection.getHealth();
				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(health, null, 2),
							mimeType: "application/json",
						},
					],
				};
			},
		);
	}
}
