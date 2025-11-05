import "reflect-metadata";
import { CONTROLLER_PATH } from "@dwex/common";

/**
 * Marks a class as a controller and defines its base path.
 *
 * @param path - The base path for all routes in this controller
 * @returns Class decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Get()
 *   findAll() {
 *     return 'This action returns all users';
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Controller()
 * class AppController {
 *   @Get('health')
 *   healthCheck() {
 *     return 'OK';
 *   }
 * }
 * ```
 */
export function Controller(path = ""): ClassDecorator {
	return (target: Function) => {
		Reflect.defineMetadata(CONTROLLER_PATH, path, target);
	};
}
