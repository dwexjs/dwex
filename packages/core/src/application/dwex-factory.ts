import type { PlatformAdapter, Type } from "@dwex/common";
import { DwexApplication } from "./dwex-application.js";

/**
 * Factory for creating Dwex applications.
 */
export class DwexFactory {
	/**
	 * Creates and initializes a Dwex application.
	 *
	 * @param module - The root module class
	 * @param adapter - Optional platform adapter (defaults to BunAdapter)
	 * @returns Initialized Dwex application
	 *
	 * @example
	 * ```typescript
	 * // Using default Bun adapter for local development
	 * import { DwexFactory } from '@dwex/core';
	 * import { AppModule } from './app.module';
	 *
	 * const app = await DwexFactory.create(AppModule);
	 * await app.listen(9929);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Using Vercel Edge adapter for deployment
	 * import { DwexFactory } from '@dwex/core';
	 * import { VercelEdgeAdapter } from '@dwex/platform-adapters';
	 * import { AppModule } from './app.module';
	 *
	 * const app = await DwexFactory.create(AppModule, new VercelEdgeAdapter());
	 * export default app.getHandler();
	 * ```
	 */
	static async create(
		module: Type<any>,
		adapter?: PlatformAdapter,
	): Promise<DwexApplication> {
		const app = new DwexApplication(module, adapter);
		await app.init();
		return app;
	}
}
