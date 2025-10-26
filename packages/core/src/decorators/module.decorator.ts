import "reflect-metadata";
import {
  GLOBAL_MODULE,
  MODULE_METADATA,
  type ModuleMetadata,
} from "@dwex/common";

/**
 * Defines a module. Modules are used to organize the application structure
 * and configure dependency injection.
 *
 * @param metadata - Module configuration
 * @returns Class decorator
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
export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(MODULE_METADATA, metadata, target);
  };
}

/**
 * Marks a module as global. Global modules are available to all modules
 * without needing to be imported.
 *
 * @returns Class decorator
 *
 * @example
 * ```typescript
 * @Global()
 * @Module({
 *   providers: [ConfigService],
 *   exports: [ConfigService],
 * })
 * class ConfigModule {}
 * ```
 */
export function Global(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(GLOBAL_MODULE, true, target);
  };
}
