/**
 * Options for configuring a Dwex application.
 */
export interface DwexApplicationOptions {
	/**
	 * Enable logging of API hits/requests to the console.
	 * When enabled, logs each incoming HTTP request with method, path, and status code.
	 *
	 * @default false
	 *
	 * @example
	 * ```typescript
	 * const app = await DwexFactory.create(AppModule, {
	 *   logRequests: true
	 * });
	 * ```
	 */
	logRequests?: boolean;
}
