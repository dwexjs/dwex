import { Injectable } from "@dwex/core";
import {
	McpServer,
	ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RequestMethod } from "@dwex/common";
import { IntrospectionService } from "./introspection.service.js";
import { LogBufferService } from "./log-buffer.service.js";
import {
	arrayToCSV,
	addCSVSummary,
	objectToKeyValueCSV,
} from "../utils/csv-formatter.js";

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
				description:
					"List all registered routes in the Dwex application (CSV format)",
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
				const routeData = routes.map((r) => ({
					path: r.path,
					method: RequestMethod[r.method],
					controller: r.controller,
					handler: r.handler,
				}));

				const csv = addCSVSummary(
					arrayToCSV(routeData, ["path", "method", "controller", "handler"]),
					`Total routes: ${routes.length}`,
				);

				return {
					content: [{ type: "text", text: csv }],
					structuredContent: {
						routes: routeData,
						count: routes.length,
					},
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
					method: z.enum([
						"GET",
						"POST",
						"PUT",
						"DELETE",
						"PATCH",
						"OPTIONS",
						"HEAD",
						"ALL",
					]),
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
				description:
					"List all services registered in the DI container (CSV format)",
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
				const serviceData = services.map((s) => ({
					token: s.token,
					name: s.name,
					scope: s.scope,
					isGlobal: s.isGlobal,
				}));

				const csv = addCSVSummary(
					arrayToCSV(serviceData, ["token", "name", "scope", "isGlobal"]),
					`Total services: ${services.length}`,
				);

				return {
					content: [{ type: "text", text: csv }],
					structuredContent: {
						services: serviceData,
						count: services.length,
					},
				};
			},
		);

		// Tool 4: Get service details
		this.server.registerTool(
			"get_service_details",
			{
				title: "Get Service Details",
				description:
					"Get detailed information about a specific service including dependencies",
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
				description:
					"List all middlewares (global and controller-scoped) (CSV format)",
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
				const middlewareData = middlewares.map((m) => ({
					name: m.name,
					type: m.type,
					controller: m.controller || "",
				}));

				const csv = addCSVSummary(
					arrayToCSV(middlewareData, ["name", "type", "controller"]),
					`Total middlewares: ${middlewares.length}`,
				);

				return {
					content: [{ type: "text", text: csv }],
					structuredContent: {
						middlewares: middlewareData,
						count: middlewares.length,
					},
				};
			},
		);

		// Tool 6: Get dependency graph
		this.server.registerTool(
			"get_dependency_graph",
			{
				title: "Get Dependency Graph",
				description:
					"Get the full dependency graph of all services (CSV format)",
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

				const csv = addCSVSummary(
					arrayToCSV(nodes, [
						"token",
						"name",
						"scope",
						"dependencies",
						"dependents",
					]),
					`Total nodes: ${nodes.length}`,
				);

				return {
					content: [{ type: "text", text: csv }],
					structuredContent: { nodes },
				};
			},
		);

		// Tool 7: Get logs
		this.server.registerTool(
			"get_logs",
			{
				title: "Get Logs",
				description: "Get recent logs from the application buffer (CSV format)",
				inputSchema: {
					level: z
						.enum(["trace", "debug", "info", "warn", "error", "fatal"])
						.optional()
						.describe("Filter by log level"),
					limit: z
						.number()
						.optional()
						.describe("Maximum number of logs to return"),
					since: z
						.string()
						.optional()
						.describe("ISO timestamp to filter logs from"),
				},
				outputSchema: {
					logs: z.array(
						z.object({
							timestamp: z.string(),
							level: z.enum([
								"trace",
								"debug",
								"info",
								"warn",
								"error",
								"fatal",
							]),
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

				const csv = addCSVSummary(
					arrayToCSV(logs, [
						"timestamp",
						"level",
						"message",
						"context",
						"data",
					]),
					`Total logs: ${logs.length}`,
				);

				return {
					content: [{ type: "text", text: csv }],
					structuredContent: {
						logs,
						count: logs.length,
					},
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
				description: "All registered routes in the application (CSV format)",
			},
			async (uri) => {
				const routes = this.introspection.getRoutes();
				const routeData = routes.map((r) => ({
					path: r.path,
					method: RequestMethod[r.method],
					controller: r.controller,
					handler: r.handler,
					guards: r.guards,
					interceptors: r.interceptors,
				}));

				const csv = addCSVSummary(
					arrayToCSV(routeData, [
						"path",
						"method",
						"controller",
						"handler",
						"guards",
						"interceptors",
					]),
					`Total routes: ${routes.length}`,
				);

				return {
					contents: [
						{
							uri: uri.href,
							text: csv,
							mimeType: "text/csv",
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
				description: "All services in the DI container (CSV format)",
			},
			async (uri) => {
				const services = this.introspection.getServices();

				const csv = addCSVSummary(
					arrayToCSV(services, [
						"token",
						"name",
						"scope",
						"isGlobal",
						"dependencies",
					]),
					`Total services: ${services.length}`,
				);

				return {
					contents: [
						{
							uri: uri.href,
							text: csv,
							mimeType: "text/csv",
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
				description: "Recent application logs (CSV format)",
			},
			async (uri) => {
				const logs = this.logBuffer.getLogs();

				const csv = addCSVSummary(
					arrayToCSV(logs, [
						"timestamp",
						"level",
						"message",
						"context",
						"data",
					]),
					`Total logs: ${logs.length}`,
				);

				return {
					contents: [
						{
							uri: uri.href,
							text: csv,
							mimeType: "text/csv",
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
				description: "Application health and statistics (CSV key-value format)",
			},
			async (uri) => {
				const health = this.introspection.getHealth();
				const csv = objectToKeyValueCSV(health);

				return {
					contents: [
						{
							uri: uri.href,
							text: csv,
							mimeType: "text/csv",
						},
					],
				};
			},
		);
	}
}
