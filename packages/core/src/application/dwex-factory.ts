import type { DwexApplicationOptions, Type } from "@dwex/common";
import { DwexApplication } from "./dwex-application.js";

/**
 * Factory for creating Dwex applications.
 */
export class DwexFactory {
	/**
	 * Creates and initializes a Dwex application.
	 *
	 * @param module - The root module class
	 * @param options - Optional configuration options for the application
	 * @returns Initialized Dwex application
	 *
	 * @example
	 * ```typescript
	 * import { DwexFactory } from '@dwex/core';
	 * import { AppModule } from './app.module';
	 *
	 * const app = await DwexFactory.create(AppModule);
	 * await app.listen(9929);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // With request logging enabled
	 * import { DwexFactory } from '@dwex/core';
	 * import { AppModule } from './app.module';
	 *
	 * const app = await DwexFactory.create(AppModule, {
	 *   logRequests: true
	 * });
	 * await app.listen(9929);
	 * ```
	 */
	static async create(
		module: Type<any>,
		options?: DwexApplicationOptions,
	): Promise<DwexApplication> {
		const app = new DwexApplication(module, options);
		await app.init();
		return app;
	}
}
