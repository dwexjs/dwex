import {
	HttpException,
	type MiddlewareFunction,
	MODULE_METADATA,
	type ModuleMetadata,
	NotFoundException,
	type Type,
} from "@dwexjs/common";
import "reflect-metadata";
import { Container } from "../di/container.js";
import { RequestHandler } from "../router/request-handler.js";
import { Router } from "../router/router.js";

/**
 * Dwex application instance.
 */
export class DwexApplication {
	private readonly container: Container;
	private readonly router: Router;
	private readonly requestHandler: RequestHandler;
	private readonly globalMiddleware: MiddlewareFunction[] = [];
	private server?: ReturnType<typeof Bun.serve>;

	constructor(private readonly rootModule: Type<any>) {
		this.container = new Container();
		this.router = new Router();
		this.requestHandler = new RequestHandler(this.container);
	}

	/**
	 * Initializes the application by scanning modules and registering providers.
	 */
	async init(): Promise<void> {
		await this.scanModule(this.rootModule);
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
	 * Starts the HTTP server.
	 *
	 * @param port - Port to listen on
	 * @param hostname - Hostname to bind to
	 * @returns Promise that resolves when the server is listening
	 *
	 * @example
	 * ```typescript
	 * await app.listen(3000);
	 * console.log('Server running on http://localhost:3000');
	 * ```
	 */
	async listen(port: number, hostname = "0.0.0.0"): Promise<void> {
		this.server = Bun.serve({
			port,
			hostname,
			fetch: this.handleRequest.bind(this),
			error: this.handleError.bind(this),
		});

		console.log(`Server listening on http://${hostname}:${port}`);
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

			// If response was manually sent, use it
			if (response.body !== undefined) {
				return new Response(response.body, {
					status: response.statusCode,
					headers: response.headers,
				});
			}

			// Auto-serialize response
			if (result !== undefined && result !== null) {
				const body =
					typeof result === "string" ? result : JSON.stringify(result);
				const headers = new Headers(response.headers);

				if (typeof result === "object") {
					headers.set("Content-Type", "application/json");
				}

				return new Response(body, {
					status: response.statusCode,
					headers,
				});
			}

			// No content
			return new Response(null, { status: 204 });
		} catch (error) {
			return this.handleError(error);
		}
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
	private async scanModule(moduleClass: Type<any>): Promise<void> {
		const metadata: ModuleMetadata | undefined = Reflect.getMetadata(
			MODULE_METADATA,
			moduleClass,
		);

		if (!metadata) {
			throw new Error(`${moduleClass.name} is not decorated with @Module()`);
		}

		// const isGlobal = Reflect.getMetadata(GLOBAL_MODULE, moduleClass);

		// Register providers
		if (metadata.providers) {
			for (const provider of metadata.providers) {
				this.container.addProvider(provider);
			}
		}

		// Scan imported modules
		if (metadata.imports) {
			for (const importedModule of metadata.imports) {
				if (typeof importedModule === "function") {
					await this.scanModule(importedModule);
				} else {
					// Dynamic module
					const dynamicModule = await importedModule;
					if ("module" in dynamicModule) {
						await this.scanModule(dynamicModule.module);

						if (dynamicModule.providers) {
							for (const provider of dynamicModule.providers) {
								this.container.addProvider(provider);
							}
						}
					}
				}
			}
		}

		// Register controllers
		if (metadata.controllers) {
			for (const ControllerClass of metadata.controllers) {
				// Add controller as a provider so it can be injected
				this.container.addProvider(ControllerClass);

				// Create controller instance
				const controller = this.container.get(ControllerClass);

				// Register routes
				this.router.registerController(controller, ControllerClass);
			}
		}
	}
}
