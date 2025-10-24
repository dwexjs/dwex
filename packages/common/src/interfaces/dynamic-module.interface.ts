import type { ModuleMetadata } from "./module-metadata.interface.js";
import type { Type } from "./type.interface.js";

/**
 * Interface for dynamically configured modules.
 *
 * @example
 * ```typescript
 * class DatabaseModule {
 *   static forRoot(options: DatabaseOptions): DynamicModule {
 *     return {
 *       module: DatabaseModule,
 *       providers: [
 *         {
 *           provide: 'DATABASE_OPTIONS',
 *           useValue: options,
 *         },
 *         DatabaseService,
 *       ],
 *       exports: [DatabaseService],
 *     };
 *   }
 * }
 * ```
 */
export interface DynamicModule extends ModuleMetadata {
	/**
	 * The module class.
	 */
	module: Type<any>;

	/**
	 * Whether this module should be global (available to all modules).
	 */
	global?: boolean;
}
