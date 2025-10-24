import type { Type } from './type.interface.js';
import type { DynamicModule } from './dynamic-module.interface.js';
import type { Provider } from './provider.interface.js';

/**
 * Metadata for a module declaration.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [DatabaseModule],
 *   controllers: [UserController],
 *   providers: [UserService],
 *   exports: [UserService],
 * })
 * class UserModule {}
 * ```
 */
export interface ModuleMetadata {
  /**
   * Modules to import into this module.
   */
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule>>;

  /**
   * Controllers defined in this module.
   */
  controllers?: Type<any>[];

  /**
   * Providers (services) available in this module.
   */
  providers?: Provider[];

  /**
   * Providers to export to other modules that import this module.
   */
  exports?: Array<Type<any> | string | symbol>;
}
