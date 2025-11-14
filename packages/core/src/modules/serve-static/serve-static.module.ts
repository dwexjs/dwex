import "reflect-metadata";
import {
	type DynamicModule,
	MODULE_METADATA,
	type ModuleMetadata,
	type ServeStaticOptions,
} from "@dwex/common";
import { createServeStaticMiddleware } from "./serve-static.middleware.js";

/**
 * Token for ServeStatic options
 */
export const SERVE_STATIC_OPTIONS = Symbol("SERVE_STATIC_OPTIONS");

/**
 * Token for ServeStatic middleware
 */
export const SERVE_STATIC_MIDDLEWARE = Symbol("SERVE_STATIC_MIDDLEWARE");

/**
 * Module for serving static files
 *
 * @example
 * ```typescript
 * // Serve a React app
 * @Module({
 *   imports: [
 *     ServeStaticModule.forRoot({
 *       rootPath: './dist',
 *       serveRoot: '/',
 *       spa: true
 *     })
 *   ]
 * })
 * class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // Serve static assets from public folder
 * @Module({
 *   imports: [
 *     ServeStaticModule.forRoot({
 *       rootPath: './public',
 *       serveRoot: '/static'
 *     })
 *   ]
 * })
 * class AppModule {}
 * ```
 */
export class ServeStaticModule {
	/**
	 * Register the ServeStatic module with configuration
	 *
	 * @param options - Static file serving options
	 * @returns Dynamic module
	 */
	static forRoot(options: ServeStaticOptions): DynamicModule {
		const middleware = createServeStaticMiddleware(options);

		return {
			module: ServeStaticModule,
			providers: [
				{
					provide: SERVE_STATIC_OPTIONS,
					useValue: options,
				},
				{
					provide: SERVE_STATIC_MIDDLEWARE,
					useValue: middleware,
				},
			],
			exports: [SERVE_STATIC_OPTIONS, SERVE_STATIC_MIDDLEWARE],
		};
	}
}

// Set minimal default metadata so ServeStaticModule can be scanned
const defaultMetadata: ModuleMetadata = {
	providers: [],
	exports: [],
};
Reflect.defineMetadata(MODULE_METADATA, defaultMetadata, ServeStaticModule);
