import {
	type DwexApplicationOptions,
	GLOBAL_MODULE,
	HttpException,
	type HttpsOptions,
	type MiddlewareFunction,
	MODULE_METADATA,
	type ModuleMetadata,
	NotFoundException,
	SseStream,
	type Type,
	asyncIterableToSseEvents,
} from "@dwex/common";
import "reflect-metadata";
import { Container } from "../di/container.js";
import { ModuleContainer, type ModuleRef } from "../di/module-container.js";
import { RequestHandler } from "../router/request-handler.js";
import { Router } from "../router/router.js";

/**
 * Dwex application instance.
 */
export class DwexApplication {
	private readonly container: Container;
	private readonly moduleContainer: ModuleContainer;
	private readonly router: Router;
	private readonly requestHandler: RequestHandler;
	private readonly globalMiddleware: MiddlewareFunction[] = [];
	private readonly controllerModuleMap = new Map<Type<any>, ModuleRef>();
	private server?: ReturnType<typeof Bun.serve>;
	private tlsEnabled = false;
	private instanceLoaderLogger?: any;
	private routesResolverLogger?: any;
	private routerExplorerLogger?: any;
	private dwexAppLogger?: any;
	private requestLogger?: any;
	private startTime: bigint;
	private options: DwexApplicationOptions;

	constructor(
		private readonly rootModule: Type<any>,
		options?: DwexApplicationOptions,
	) {
		this.startTime = process.hrtime.bigint();
		this.options = options || {};
		this.container = new Container();
		this.moduleContainer = new ModuleContainer();
		this.container.setModuleContainer(this.moduleContainer);
		this.router = new Router();
		this.requestHandler = new RequestHandler(this.container);
	}

	/**
	 * Initializes the application by scanning modules and registering providers.
	 */
	async init(): Promise<void> {
		// First scan to register all providers
		await this.scanModule(this.rootModule, true);

		// Try to create logger instances (if LoggerModule was imported)
		try {
			const { Logger } = await import("@dwex/logger");
			this.instanceLoaderLogger = new Logger("InstanceLoader");
			this.routesResolverLogger = new Logger("RoutesResolver");
			this.routerExplorerLogger = new Logger("RouterExplorer");
			this.dwexAppLogger = new Logger("DwexApplication");
			if (this.options.logRequests) {
				this.requestLogger = new Logger("HTTP");
			}
		} catch {
			// Logger not available, that's okay
		}
	}

	/**
	 * Adds global middleware that runs before all routes.
	 *
	 * @param middleware - Middleware function
	 *
	 * @example
	 * ```typescript
	 * app.use(corsMiddleware());
	 * app.use(bodyParserMiddleware());
	 * ```
	 */
	use(middleware: MiddlewareFunction): void {
		this.globalMiddleware.push(middleware);
	}

	/**
	 * Sets a global prefix for all routes.
	 * This prefix will be prepended to all controller routes.
	 * Note: This does NOT affect static file serving middleware.
	 *
	 * @param prefix - The global prefix (e.g., 'api', 'v1', etc.)
	 *
	 * @example
	 * ```typescript
	 * app.setGlobalPrefix('api');
	 * // All controller routes will now have /api prefix
	 * // Example: /users becomes /api/users
	 * // Static files remain unaffected: / still serves index.html
	 * ```
	 */
	setGlobalPrefix(prefix: string): void {
		this.router.setGlobalPrefix(prefix);
	}

	/**
	 * Starts the HTTP server.
	 *
	 * @param port - Port to listen on
	 * @param hostname - Hostname to bind to
	 * @param httpsOptions - Optional TLS/HTTPS configuration
	 * @returns Promise that resolves when the server is listening
	 *
	 * @example
	 * ```typescript
	 * // HTTP server
	 * await app.listen(9929);
	 * console.log('Server running on http://localhost:9929');
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // HTTPS server with TLS
	 * await app.listen(9929, '0.0.0.0', {
	 *   cert: Bun.file('./cert.pem'),
	 *   key: Bun.file('./key.pem'),
	 * });
	 * console.log('Server running on https://localhost:9929');
	 * ```
	 */
	async listen(
		port: number,
		hostname = "0.0.0.0",
		httpsOptions?: HttpsOptions,
	): Promise<void> {
		this.tlsEnabled = !!httpsOptions;

		this.server = Bun.serve({
			port,
			hostname,
			fetch: this.handleRequest.bind(this),
			error: this.handleError.bind(this),
			...(httpsOptions && { tls: httpsOptions }),
		});

		// Print banner with all info at the very top
		await this.printStartupBanner();

		// Log module initialization
		await this.scanModule(this.rootModule, false, true);

		// Log all registered routes
		this.logRoutes();

		// Log completion message
		if (this.dwexAppLogger) {
			const endTime = process.hrtime.bigint();
			const startupTimeNs = endTime - this.startTime;

			const ms = Number(startupTimeNs) / 1e6;
			const us = Number(startupTimeNs) / 1e3;

			let formattedTime: string;

			if (ms >= 1) {
				formattedTime = `${ms.toFixed(2)}ms`;
			} else {
				formattedTime = `${us.toFixed(2)}μs`;
			}

			this.dwexAppLogger.log(`Ready in ${formattedTime}`);
		}
	}

	/**
	 * Stops the HTTP server.
	 */
	async close(): Promise<void> {
		if (this.server) {
			this.server.stop();
		}
	}

	/**
	 * Gets the underlying DI container.
	 */
	getContainer(): Container {
		return this.container;
	}

	/**
	 * Gets the router instance.
	 */
	getRouter(): Router {
		return this.router;
	}

	/**
	 * Handles incoming HTTP requests.
	 */
	private async handleRequest(req: Request): Promise<Response> {
		const startTime = this.options.logRequests ? performance.now() : 0;

		try {
			// Create a mutable request object
			const request: any = {
				...req,
				url: new URL(req.url).pathname + new URL(req.url).search,
				method: req.method,
				headers: Object.fromEntries(req.headers.entries()),
				text: () => req.text(),
				json: () => req.json(),
			};

			// Create response object
			const response: any = {
				statusCode: 200,
				headers: new Headers(),
				body: undefined,
				setHeader(key: string, value: string) {
					this.headers.set(key, value);
					return this;
				},
				status(code: number) {
					this.statusCode = code;
					return this;
				},
				send(data: any) {
					this.body = data;
					return this;
				},
				json(data: any) {
					this.headers.set("Content-Type", "application/json");
					this.body = JSON.stringify(data);
					return this;
				},
				end() {
					return this;
				},
			};

			// Execute global middleware
			await this.executeMiddleware(request, response, this.globalMiddleware);

			// If middleware handled the response, return early
			if (response.body !== undefined) {
				const res = new Response(response.body, {
					status: response.statusCode,
					headers: response.headers,
				});
				this.logRequest(request.method, request.url, res.status, startTime);
				return res;
			}

			// Find matching route
			const route = this.router.findRoute(
				request.method,
				request.url.split("?")[0],
			);

			if (!route) {
				throw new NotFoundException(
					`Cannot ${request.method} ${request.url.split("?")[0]}`,
				);
			}

			// Execute route handler
			const result = await this.requestHandler.handle(route, request, response);

			// Handle SSE streams
			if (result instanceof SseStream) {
				// Merge middleware headers (e.g., CORS) with SSE-specific headers
				const headers = new Headers(response.headers);
				headers.set("Content-Type", "text/event-stream");
				headers.set("Cache-Control", "no-cache, no-transform");
				headers.set("Connection", "keep-alive");
				headers.set("X-Accel-Buffering", "no"); // Disable buffering in nginx

				const sseResponse = new Response(result.getStream(), {
					status: 200,
					headers,
				});
				this.logRequest(request.method, request.url, 200, startTime);
				return sseResponse;
			}

			// Handle async generators/iterators (for @Sse() decorated methods)
			if (this.isAsyncIterable(result)) {
				const asyncIterator = asyncIterableToSseEvents(result);
				const stream = new ReadableStream({
					async start(controller) {
						try {
							for await (const chunk of asyncIterator) {
								controller.enqueue(chunk);
							}
							controller.close();
						} catch (error) {
							controller.error(error);
						}
					},
				});

				// Merge middleware headers (e.g., CORS) with SSE-specific headers
				const headers = new Headers(response.headers);
				headers.set("Content-Type", "text/event-stream");
				headers.set("Cache-Control", "no-cache, no-transform");
				headers.set("Connection", "keep-alive");
				headers.set("X-Accel-Buffering", "no");

				const sseResponse = new Response(stream, {
					status: 200,
					headers,
				});
				this.logRequest(request.method, request.url, 200, startTime);
				return sseResponse;
			}

			// If result is already a Response object, return it directly
			if (result instanceof Response) {
				this.logRequest(request.method, request.url, result.status, startTime);
				return result;
			}

			// If response was manually sent, use it
			if (response.body !== undefined) {
				const res = new Response(response.body, {
					status: response.statusCode,
					headers: response.headers,
				});
				this.logRequest(request.method, request.url, res.status, startTime);
				return res;
			}

			// Auto-serialize response
			if (result !== undefined && result !== null) {
				const body =
					typeof result === "string" ? result : JSON.stringify(result);
				const headers = new Headers(response.headers);

				if (typeof result === "object") {
					headers.set("Content-Type", "application/json");
				}

				const res = new Response(body, {
					status: response.statusCode,
					headers,
				});
				this.logRequest(request.method, request.url, res.status, startTime);
				return res;
			}

			// No content
			const res = new Response(null, { status: 204 });
			this.logRequest(request.method, request.url, res.status, startTime);
			return res;
		} catch (error) {
			const errorResponse = this.handleError(error);
			this.logRequest(
				req.method,
				new URL(req.url).pathname + new URL(req.url).search,
				errorResponse.status,
				startTime,
			);
			return errorResponse;
		}
	}

	/**
	 * Checks if a value is an async iterable (async generator or async iterator).
	 */
	private isAsyncIterable(value: any): boolean {
		return (
			value !== null &&
			value !== undefined &&
			typeof value === "object" &&
			(typeof value[Symbol.asyncIterator] === "function" ||
				typeof value.next === "function")
		);
	}

	/**
	 * Logs HTTP request if request logging is enabled.
	 */
	private logRequest(
		method: string,
		url: string,
		status: number,
		startTime: number,
	): void {
		if (!this.requestLogger || !this.options.logRequests) return;

		const duration = performance.now() - startTime;
		const formattedDuration = duration >= 1 ? `${duration.toFixed(2)}ms` : `${(duration * 1000).toFixed(2)}μs`;

		// Color code based on status
		let statusColor = "\x1b[32m"; // green for 2xx
		if (status >= 500) {
			statusColor = "\x1b[31m"; // red for 5xx
		} else if (status >= 400) {
			statusColor = "\x1b[33m"; // yellow for 4xx
		} else if (status >= 300) {
			statusColor = "\x1b[36m"; // cyan for 3xx
		}
		const reset = "\x1b[0m";

		this.requestLogger.log(
			`${method} ${url} ${statusColor}${status}${reset} ${formattedDuration}`,
		);
	}

	/**
	 * Executes middleware chain.
	 */
	private async executeMiddleware(
		req: any,
		res: any,
		middleware: MiddlewareFunction[],
	): Promise<void> {
		for (const mw of middleware) {
			await new Promise<void>((resolve, reject) => {
				mw(req, res, (error?: any) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				});
			});
		}
	}

	/**
	 * Handles errors and returns appropriate responses.
	 */
	private handleError(error: any): Response {
		if (error instanceof HttpException) {
			const response = error.getResponse();
			const status = error.getStatus();

			return new Response(
				JSON.stringify(
					typeof response === "string"
						? { statusCode: status, message: response }
						: response,
				),
				{
					status,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Log unexpected errors
		console.error("Unhandled error:", error);

		return new Response(
			JSON.stringify({
				statusCode: 500,
				message: "Internal Server Error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	/**
	 * Scans a module and registers its providers and controllers.
	 */
	private async scanModule(
		moduleClass: Type<any>,
		register = true,
		logOnly = false,
		parentModule?: ModuleRef,
	): Promise<ModuleRef> {
		const metadata: ModuleMetadata | undefined = Reflect.getMetadata(
			MODULE_METADATA,
			moduleClass,
		);

		if (!metadata) {
			throw new Error(`${moduleClass.name} is not decorated with @Module()`);
		}

		// Create or get module reference
		let moduleRef = this.moduleContainer.getModule(moduleClass);
		if (!moduleRef) {
			moduleRef = this.moduleContainer.addModule(moduleClass);
		}

		// Log module initialization (only on second pass if logger available)
		if (logOnly && this.instanceLoaderLogger) {
			this.instanceLoaderLogger.log(
				`${moduleClass.name} dependencies initialized`,
			);
		}

		// Scan imported modules first (only on first pass)
		if (register && metadata.imports) {
			for (const importedModule of metadata.imports) {
				if (typeof importedModule === "function") {
					const importedModuleRef = await this.scanModule(
						importedModule,
						register,
						logOnly,
						moduleRef,
					);
					moduleRef.addImport(importedModuleRef);
				} else {
					// Dynamic module
					const dynamicModule = await importedModule;
					if ("module" in dynamicModule) {
						const importedModuleRef = await this.scanModule(
							dynamicModule.module,
							register,
							logOnly,
							moduleRef,
						);
						moduleRef.addImport(importedModuleRef);

						// Handle dynamic module providers
						if (register && dynamicModule.providers) {
							for (const provider of dynamicModule.providers) {
								importedModuleRef.addProvider(provider);
								this.container.addProvider(provider);

								// Track provider ownership
								const token =
									typeof provider === "function" ? provider : provider.provide;
								if (token) {
									this.container.setProviderModule(token, importedModuleRef);
								}
							}

							// Eagerly instantiate dynamic module providers and call lifecycle hooks
							for (const provider of dynamicModule.providers) {
								const token =
									typeof provider === "function" ? provider : provider.provide;
								if (token) {
									const instance = this.container.get(token, false, importedModuleRef);
									await this.container.callModuleInitHook(instance);
								}
							}
						}

						// Handle dynamic module exports
						if (register && dynamicModule.exports) {
							for (const exportToken of dynamicModule.exports) {
								importedModuleRef.addExport(exportToken);
							}
						}

						// Handle global flag
						if (dynamicModule.global) {
							Reflect.defineMetadata(
								GLOBAL_MODULE,
								true,
								dynamicModule.module,
							);
						}
					}
				}
			}
		}

		// Register providers (only on first pass)
		if (register && metadata.providers) {
			for (const provider of metadata.providers) {
				moduleRef.addProvider(provider);
				this.container.addProvider(provider);

				// Track which module owns this provider
				const token =
					typeof provider === "function" ? provider : provider.provide;
				if (token) {
					this.container.setProviderModule(token, moduleRef);
				}
			}

			// Call OnModuleInit lifecycle hooks for providers
			for (const provider of metadata.providers) {
				const token =
					typeof provider === "function" ? provider : provider.provide;
				if (token) {
					const instance = this.container.get(token, false, moduleRef);
					await this.container.callModuleInitHook(instance);
				}
			}
		}

		// Register exports (only on first pass)
		if (register && metadata.exports) {
			for (const exportToken of metadata.exports) {
				moduleRef.addExport(exportToken);
			}
		}

		// Register controllers (only on first pass)
		if (register && metadata.controllers) {
			for (const ControllerClass of metadata.controllers) {
				// Add controller as a provider to the module
				moduleRef.addProvider(ControllerClass);
				this.container.addProvider(ControllerClass);

				// Track which module this controller belongs to
				this.controllerModuleMap.set(ControllerClass, moduleRef);
				this.container.setProviderModule(ControllerClass, moduleRef);

				// Create controller instance with module context
				const controller = this.container.get(ControllerClass, false, moduleRef);

				// Register routes
				this.router.registerController(controller, ControllerClass);
			}
		}

		return moduleRef;
	}

	/**
	 * Prints startup banner with all server information
	 */
	private async printStartupBanner(): Promise<void> {
		if (!this.server) return;

		// Read version from package.json
		const corePackagePath = new URL(
			import.meta.resolve("@dwex/core/package.json"),
		);
		const packageJson = await Bun.file(corePackagePath).json();
		const version = packageJson.version;

		const pid = process.pid;
		const port = this.server.port;
		const protocol = this.tlsEnabled ? "https" : "http";

		// Colors - Purple/Pink theme
		const pink = "\x1b[38;2;228;90;146m"; // #E45A92
		const dim = "\x1b[90m";
		const reset = "\x1b[39m";

		console.log("");
		console.log(`  ${pink}◆${reset} Dwex ${dim}v${version}${reset}`);
		console.log("");
		console.log(`  ${dim}Local:${reset}   ${protocol}://localhost:${port}`);
		console.log(`  ${dim}PID:${reset}     ${pid}`);
		console.log("");
	}

	/**
	 * Logs all registered routes.
	 */
	private logRoutes(): void {
		if (!this.routesResolverLogger || !this.routerExplorerLogger) return;

		const routes = this.router.getRoutes();
		const groupedRoutes: Record<
			string,
			Array<{ method: string; path: string; controllerPath: string }>
		> = {};

		// Group routes by controller
		for (const route of routes) {
			const controllerName = route.controller.constructor.name;
			if (!groupedRoutes[controllerName]) {
				groupedRoutes[controllerName] = [];
			}

			// Extract base path (everything before the first param or end of path)
			const basePath = route.path.split(":")[0].replace(/\/$/, "") || "/";

			groupedRoutes[controllerName].push({
				method: route.method,
				path: route.path,
				controllerPath: basePath,
			});
		}

		// Log routes by controller
		for (const [controllerName, controllerRoutes] of Object.entries(
			groupedRoutes,
		)) {
			// Log controller registration
			const controllerPath = controllerRoutes[0]?.controllerPath || "/";
			this.routesResolverLogger.log(`${controllerName} {${controllerPath}}`);

			// Log each route
			for (const route of controllerRoutes) {
				this.routerExplorerLogger.log(
					`Mapped {${route.path}, ${route.method}} route`,
				);
			}
		}
	}
}
