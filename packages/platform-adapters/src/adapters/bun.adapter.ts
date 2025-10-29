import type { ListenOptions, PlatformAdapter } from "@dwex/common";

/**
 * Platform adapter for Bun runtime.
 *
 * This is the default adapter for local development and production deployments using Bun.
 * Uses Bun.serve() for high-performance HTTP server.
 *
 * @example
 * ```typescript
 * import { DwexFactory } from '@dwex/core';
 * import { BunAdapter } from '@dwex/platform-adapters';
 * import { AppModule } from './app.module';
 *
 * const app = await DwexFactory.create(AppModule, new BunAdapter());
 * await app.listen(3000);
 * ```
 */
export class BunAdapter implements PlatformAdapter {
	readonly name = "bun";
	readonly supportsListen = true;
	readonly requiresHandler = false;

	private server?: ReturnType<typeof Bun.serve>;

	/**
	 * Starts the Bun HTTP server.
	 *
	 * @param handleRequest - Core request handler function
	 * @param options - Server configuration (port, hostname, TLS)
	 */
	async listen(
		handleRequest: (request: Request) => Promise<Response>,
		options: ListenOptions,
	): Promise<void> {
		const { port, hostname = "0.0.0.0", httpsOptions } = options;

		this.server = Bun.serve({
			port,
			hostname,
			fetch: handleRequest,
			error: (error: Error) => {
				console.error("Server error:", error);
				return new Response("Internal Server Error", { status: 500 });
			},
			...(httpsOptions && { tls: httpsOptions }),
		});
	}

	/**
	 * Stops the Bun server.
	 */
	async destroy(): Promise<void> {
		if (this.server) {
			this.server.stop();
			this.server = undefined;
		}
	}

	/**
	 * Gets the server instance (useful for testing).
	 */
	getServer(): ReturnType<typeof Bun.serve> | undefined {
		return this.server;
	}
}
