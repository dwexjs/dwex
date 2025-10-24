import type { Type } from "@dwexjs/common";
import { DwexApplication } from "./dwex-application.js";

/**
 * Factory for creating Dwex applications.
 */
export class DwexFactory {
	/**
	 * Creates and initializes a Dwex application.
	 *
	 * @param module - The root module class
	 * @returns Initialized Dwex application
	 *
	 * @example
	 * ```typescript
	 * import { DwexFactory } from '@dwexjs/core';
	 * import { AppModule } from './app.module';
	 *
	 * const app = await DwexFactory.create(AppModule);
	 * await app.listen(3000);
	 * ```
	 */
	static async create(module: Type<any>): Promise<DwexApplication> {
		const app = new DwexApplication(module);
		await app.init();
		return app;
	}
}
