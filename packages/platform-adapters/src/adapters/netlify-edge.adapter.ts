import type { ListenOptions, PlatformAdapter } from "@dwex/common";

/**
 * Platform adapter for Netlify Edge Functions.
 *
 * Netlify Edge Functions run on Deno at the edge using the Web API standard.
 * They require exporting a default handler function.
 *
 * @example
 * ```typescript
 * // netlify/edge-functions/api.ts
 * import { DwexFactory } from '@dwex/core';
 * import { NetlifyEdgeAdapter } from '@dwex/platform-adapters';
 * import { AppModule } from './app.module';
 *
 * const app = await DwexFactory.create(AppModule, new NetlifyEdgeAdapter());
 * export default app.getHandler();
 * ```
 *
 * @example
 * ```typescript
 * // netlify.toml
 * [[edge_functions]]
 * path = "/api/*"
 * function = "api"
 * ```
 */
export class NetlifyEdgeAdapter implements PlatformAdapter {
	readonly name = "netlify-edge";
	readonly supportsListen = false;
	readonly requiresHandler = true;

	/**
	 * Not supported on Netlify Edge Functions.
	 * @throws Error
	 */
	listen(
		_handleRequest: (request: Request) => Promise<Response>,
		_options: ListenOptions,
	): Promise<void> {
		throw new Error(
			"NetlifyEdgeAdapter does not support listen(). Use getHandler() instead and export the handler.",
		);
	}

	/**
	 * Creates a Netlify Edge Function handler.
	 *
	 * @param handleRequest - Core request handler function
	 * @returns Handler function compatible with Netlify Edge runtime
	 */
	createHandler(
		handleRequest: (request: Request) => Promise<Response>,
	): (
		request: Request,
		context?: Record<string, unknown>,
	) => Promise<Response> {
		return async (
			request: Request,
			_context?: Record<string, unknown>,
		): Promise<Response> => {
			try {
				// You can access _context if needed in the future (geo, cookies, etc.)
				// For now, just pass the request to the core handler
				return await handleRequest(request);
			} catch (error) {
				console.error("Netlify Edge Function error:", error);
				return new Response("Internal Server Error", { status: 500 });
			}
		};
	}
}
