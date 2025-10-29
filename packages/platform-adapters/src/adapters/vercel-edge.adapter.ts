import type { ListenOptions, PlatformAdapter } from "@dwex/common";

/**
 * Platform adapter for Vercel Edge Functions.
 *
 * Vercel Edge Functions run on V8 isolates and use the Web API standard for Request/Response.
 * They don't support long-running servers, so you must export a handler function instead.
 *
 * @example
 * ```typescript
 * // api/index.ts
 * import { DwexFactory } from '@dwex/core';
 * import { VercelEdgeAdapter } from '@dwex/platform-adapters';
 * import { AppModule } from './app.module';
 *
 * const app = await DwexFactory.create(AppModule, new VercelEdgeAdapter());
 * export default app.getHandler();
 * ```
 *
 * @example
 * ```typescript
 * // vercel.json
 * {
 *   "functions": {
 *     "api/**\/*.ts": {
 *       "runtime": "edge"
 *     }
 *   }
 * }
 * ```
 */
export class VercelEdgeAdapter implements PlatformAdapter {
	readonly name = "vercel-edge";
	readonly supportsListen = false;
	readonly requiresHandler = true;

	/**
	 * Not supported on Vercel Edge Functions.
	 * @throws Error
	 */
	listen(
		_handleRequest: (request: Request) => Promise<Response>,
		_options: ListenOptions,
	): Promise<void> {
		throw new Error(
			"VercelEdgeAdapter does not support listen(). Use getHandler() instead and export the handler.",
		);
	}

	/**
	 * Creates a Vercel Edge Function handler.
	 *
	 * @param handleRequest - Core request handler function
	 * @returns Handler function compatible with Vercel Edge runtime
	 */
	createHandler(
		handleRequest: (request: Request) => Promise<Response>,
	): (request: Request) => Promise<Response> {
		return async (request: Request): Promise<Response> => {
			try {
				return await handleRequest(request);
			} catch (error) {
				console.error("Vercel Edge Function error:", error);
				return new Response("Internal Server Error", { status: 500 });
			}
		};
	}
}
