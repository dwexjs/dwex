import { RequestMethod, ROUTE_PARAMS } from "@dwex/common";
import type { DwexApplication } from "@dwex/core";
import { type DynamicModule, Module, ParamType } from "@dwex/core";
import {
	AI_MODULE_CONFIG,
	type AiModuleConfig,
} from "./config/ai-config.interface.js";
import {
	DWEX_APPLICATION,
	DWEX_CONTAINER,
	DWEX_ROUTER,
} from "./constants/tokens.js";
import { IntrospectionService } from "./services/introspection.service.js";
import { LogBufferService } from "./services/log-buffer.service.js";
import { McpService } from "./services/mcp.service.js";
import { DwexMcpHandler } from "./transport/dwex-mcp-handler.js";

/**
 * Default configuration for AI Module
 */
const DEFAULT_CONFIG: AiModuleConfig = {
	enableAuth: false,
	path: "/mcp",
	logBufferSize: 1000,
	enabled: true,
};

/**
 * AI Module for integrating Model Context Protocol (MCP) server
 *
 * @example
 * ```typescript
 * // In your app.ts or main.ts
 * const app = await DwexFactory.create(AppModule);
 *
 * // Setup MCP with builder pattern
 * new AiModule()
 *   .setPath("/mcp")
 *   .enableAuth(process.env.MCP_API_KEY)
 *   .setLogBufferSize(1000)
 *   .setup(app);
 *
 * await app.listen(3000);
 * // MCP server available at: http://localhost:3000/mcp
 * ```
 */
@Module({})
export class AiModule {
	private config: AiModuleConfig;

	constructor() {
		this.config = { ...DEFAULT_CONFIG };
	}

	/**
	 * Set the MCP endpoint path
	 * @param path - The endpoint path (default: "/mcp")
	 * @returns this instance for chaining
	 */
	setPath(path: string): this {
		this.config.path = path;
		return this;
	}

	/**
	 * Enable authentication with an API key
	 * @param apiKey - The API key to use for authentication
	 * @returns this instance for chaining
	 */
	enableAuth(apiKey?: string): this {
		this.config.enableAuth = true;
		if (apiKey) {
			this.config.apiKey = apiKey;
		}
		return this;
	}

	/**
	 * Disable authentication
	 * @returns this instance for chaining
	 */
	disableAuth(): this {
		this.config.enableAuth = false;
		this.config.apiKey = undefined;
		return this;
	}

	/**
	 * Set the API key for authentication
	 * @param apiKey - The API key
	 * @returns this instance for chaining
	 */
	setApiKey(apiKey: string): this {
		this.config.apiKey = apiKey;
		return this;
	}

	/**
	 * Set the log buffer size
	 * @param size - Number of logs to keep in memory (default: 1000)
	 * @returns this instance for chaining
	 */
	setLogBufferSize(size: number): this {
		this.config.logBufferSize = size;
		return this;
	}

	/**
	 * Enable the MCP server
	 * @returns this instance for chaining
	 */
	enable(): this {
		this.config.enabled = true;
		return this;
	}

	/**
	 * Disable the MCP server
	 * @returns this instance for chaining
	 */
	disable(): this {
		this.config.enabled = false;
		return this;
	}

	/**
	 * Configure AI Module with custom options (not recommended - use builder pattern instead)
	 * This method is kept for potential future use with proper lifecycle hooks
	 */
	static forRoot(config: AiModuleConfig = {}): DynamicModule {
		const mergedConfig = { ...DEFAULT_CONFIG, ...config };

		return {
			module: AiModule,
			providers: [
				{
					provide: AI_MODULE_CONFIG,
					useValue: mergedConfig,
				},
				LogBufferService,
				IntrospectionService,
				McpService,
			],
			controllers: [],
			exports: [McpService, IntrospectionService, LogBufferService],
		};
	}

	/**
	 * Setup MCP server on a Dwex application
	 * This should be called AFTER DwexFactory.create() but BEFORE app.listen()
	 *
	 * @param app - The Dwex application instance
	 *
	 * @example
	 * ```typescript
	 * const app = await DwexFactory.create(AppModule);
	 *
	 * new AiModule()
	 *   .setPath("/mcp")
	 *   .enableAuth(process.env.MCP_API_KEY)
	 *   .setup(app);
	 *
	 * await app.listen(3000);
	 * ```
	 */
	setup(app: DwexApplication): void {
		if (!this.config.enabled) {
			return;
		}

		const container = app.getContainer();
		const router = app.getRouter();

		// Register core dependencies as value providers
		container.addProvider({
			provide: DWEX_APPLICATION,
			useValue: app,
		});

		container.addProvider({
			provide: DWEX_CONTAINER,
			useValue: container,
		});

		container.addProvider({
			provide: DWEX_ROUTER,
			useValue: router,
		});

		container.addProvider({
			provide: AI_MODULE_CONFIG,
			useValue: this.config,
		});

		// Register services
		container.addProvider(LogBufferService);
		container.addProvider(IntrospectionService);
		container.addProvider(McpService);

		// Get MCP service instance to initialize it
		const mcpService = container.get(McpService);

		// Create custom MCP handler
		const mcpHandler = new DwexMcpHandler(mcpService.server);

		// Manually register the MCP route
		const path = this.config.path || "/mcp";
		const controller = {
			constructor: {
				name: "McpController",
			},
		};

		// Capture config in closure for use in handler
		const config = this.config;

		// Create the handler that will handle MCP requests
		const handler = async function (this: any, req: any, res: any, body: any) {
			// Authentication check if enabled
			if (config.enableAuth) {
				const apiKey =
					req.headers?.["x-api-key"] ||
					req.headers?.["authorization"]?.replace("Bearer ", "");

				if (!apiKey || apiKey !== config.apiKey) {
					return res.status(401).json({
						jsonrpc: "2.0",
						error: {
							code: -32600,
							message: "Unauthorized: Invalid or missing API key",
						},
						id: null,
					});
				}
			}

			try {
				// Parse the JSON-RPC request
				const request = body;

				// Handle the request and get the response
				const response = await mcpHandler.handleRequest(request);

				// Return the JSON-RPC response
				return res.status(200).json(response);
			} catch (error) {
				console.error("Error handling MCP request:", error);

				return res.status(500).json({
					jsonrpc: "2.0",
					error: {
						code: -32603,
						message: "Internal server error",
					},
					id: null,
				});
			}
		};

		// Add route parameter metadata for @Req(), @Res(), @Body()
		Reflect.defineMetadata(
			ROUTE_PARAMS,
			[
				{ index: 0, type: ParamType.REQUEST },
				{ index: 1, type: ParamType.RESPONSE },
				{ index: 2, type: ParamType.BODY },
			],
			handler,
		);

		// Register the route
		router.getRoutes().push({
			path,
			method: RequestMethod.POST,
			handler,
			controller,
			params: [],
			guards: [],
			interceptors: [],
		});

		// Setup log interception if Logger is available
		try {
			const { Logger } = require("@dwex/logger");
			const originalLog = Logger.prototype.log;
			const logBuffer = container.get(LogBufferService);

			// Intercept logger calls
			Logger.prototype.log = function (
				level: string,
				message: string,
				...args: any[]
			) {
				// Add to buffer
				logBuffer.addLog({
					timestamp: new Date().toISOString(),
					level: level as any,
					message,
					context: this.context,
					data: args.length > 0 ? args : undefined,
				});

				// Call original
				return originalLog.call(this, level, message, ...args);
			};
		} catch {
			// Logger not available, skip log interception
		}
	}
}
