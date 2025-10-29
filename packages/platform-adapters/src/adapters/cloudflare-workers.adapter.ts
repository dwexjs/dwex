import type { ListenOptions, PlatformAdapter } from "@dwex/common";

/**
 * Platform adapter for Cloudflare Workers.
 *
 * Cloudflare Workers run on V8 isolates globally and use the Web API standard.
 * They require exporting a `fetch` handler in a specific format.
 *
 * @example
 * ```typescript
 * // src/index.ts
 * import { DwexFactory } from '@dwex/core';
 * import { CloudflareWorkersAdapter } from '@dwex/platform-adapters';
 * import { AppModule } from './app.module';
 *
 * const app = await DwexFactory.create(AppModule, new CloudflareWorkersAdapter());
 *
 * export default {
 *   fetch: app.getHandler()
 * };
 * ```
 *
 * @example
 * ```typescript
 * // wrangler.toml
 * name = "my-dwex-app"
 * main = "src/index.ts"
 * compatibility_date = "2024-01-01"
 * ```
 */
export class CloudflareWorkersAdapter implements PlatformAdapter {
	readonly name = "cloudflare-workers";
	readonly supportsListen = false;
	readonly requiresHandler = true;

	/**
	 * Not supported on Cloudflare Workers.
	 * @throws Error
	 */
	listen(
		_handleRequest: (request: Request) => Promise<Response>,
		_options: ListenOptions,
	): Promise<void> {
		throw new Error(
			"CloudflareWorkersAdapter does not support listen(). Use getHandler() instead and export as fetch handler.",
		);
	}

	/**
	 * Creates a Cloudflare Workers fetch handler.
	 *
	 * @param handleRequest - Core request handler function
	 * @returns Handler function compatible with Cloudflare Workers runtime
	 */
	createHandler(
		handleRequest: (request: Request) => Promise<Response>,
	): (
		request: Request,
		env?: Record<string, unknown>,
		ctx?: unknown,
	) => Promise<Response> {
		return async (
			request: Request,
			_env?: Record<string, unknown>,
			_ctx?: unknown,
		): Promise<Response> => {
			try {
				// You can access _env and _ctx if needed in the future
				// For now, just pass the request to the core handler
				return await handleRequest(request);
			} catch (error) {
				console.error("Cloudflare Workers error:", error);
				return new Response("Internal Server Error", { status: 500 });
			}
		};
	}
}
