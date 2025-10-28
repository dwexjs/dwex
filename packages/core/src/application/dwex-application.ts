import {
  HttpException,
  type HttpsOptions,
  type MiddlewareFunction,
  MODULE_METADATA,
  type ModuleMetadata,
  NotFoundException,
  type Type,
} from "@dwex/common";
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
  private tlsEnabled = false;
  private instanceLoaderLogger?: any;
  private routesResolverLogger?: any;
  private routerExplorerLogger?: any;
  private dwexAppLogger?: any;

  constructor(private readonly rootModule: Type<any>) {
    this.container = new Container();
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
    } catch (error) {
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
   * console.log('Server running on http://localhost:3000');
   * ```
   *
   * @example
   * ```typescript
   * // HTTPS server with TLS
   * await app.listen(3000, '0.0.0.0', {
   *   cert: Bun.file('./cert.pem'),
   *   key: Bun.file('./key.pem'),
   * });
   * console.log('Server running on https://localhost:3000');
   * ```
   */
  async listen(
    port: number,
    hostname = "0.0.0.0",
    httpsOptions?: HttpsOptions
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
      this.dwexAppLogger.log("Ready");
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
        request.url.split("?")[0]
      );

      if (!route) {
        throw new NotFoundException(
          `Cannot ${request.method} ${request.url.split("?")[0]}`
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
    middleware: MiddlewareFunction[]
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
            : response
        ),
        {
          status,
          headers: { "Content-Type": "application/json" },
        }
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
      }
    );
  }

  /**
   * Scans a module and registers its providers and controllers.
   */
  private async scanModule(
    moduleClass: Type<any>,
    register = true,
    logOnly = false
  ): Promise<void> {
    const metadata: ModuleMetadata | undefined = Reflect.getMetadata(
      MODULE_METADATA,
      moduleClass
    );

    if (!metadata) {
      throw new Error(`${moduleClass.name} is not decorated with @Module()`);
    }

    // Log module initialization (only on second pass if logger available)
    if (logOnly && this.instanceLoaderLogger) {
      this.instanceLoaderLogger.log(
        `${moduleClass.name} dependencies initialized`
      );
    }

    // const isGlobal = Reflect.getMetadata(GLOBAL_MODULE, moduleClass);

    // Register providers (only on first pass)
    if (register && metadata.providers) {
      for (const provider of metadata.providers) {
        this.container.addProvider(provider);
      }
    }

    // Scan imported modules
    if (metadata.imports) {
      for (const importedModule of metadata.imports) {
        if (typeof importedModule === "function") {
          await this.scanModule(importedModule, register, logOnly);
        } else {
          // Dynamic module
          const dynamicModule = await importedModule;
          if ("module" in dynamicModule) {
            await this.scanModule(dynamicModule.module, register, logOnly);

            if (register && dynamicModule.providers) {
              for (const provider of dynamicModule.providers) {
                this.container.addProvider(provider);
              }
            }
          }
        }
      }
    }

    // Register controllers (only on first pass)
    if (register && metadata.controllers) {
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

  /**
   * Prints startup banner with all server information
   */
  private async printStartupBanner(): Promise<void> {
    if (!this.server) return;

    // Read version from package.json
    const corePackagePath = new URL(import.meta.resolve("@dwex/core/package.json"));
    const packageJson = await Bun.file(corePackagePath).json();
    const version = packageJson.version;

    const pid = process.pid;
    const port = this.server.port;
    const hostname = this.server.hostname;
    const protocol = this.tlsEnabled ? "https" : "http";

    // Colors - Purple/Pink theme
    const pink = "\x1b[38;2;228;90;146m"; // #E45A92
    const dim = "\x1b[90m";
    const reset = "\x1b[39m";

    console.log("");
    console.log(`  ${pink}◆${reset} Dwex ${dim}v${version}${reset}`);
    console.log("");
    console.log(`  ${dim}Local:${reset}   ${protocol}://${hostname}:${port}`);
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
      groupedRoutes
    )) {
      // Log controller registration
      const controllerPath = controllerRoutes[0]?.controllerPath || "/";
      this.routesResolverLogger.log(`${controllerName} {${controllerPath}}`);

      // Log each route
      for (const route of controllerRoutes) {
        this.routerExplorerLogger.log(
          `Mapped {${route.path}, ${route.method}} route`
        );
      }
    }
  }
}
