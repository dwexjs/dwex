import "reflect-metadata";
import {
	type DwexMiddleware,
	MIDDLEWARE_METADATA,
	type MiddlewareFunction,
	type Type,
} from "@dwex/common";

/**
 * Applies middleware to a controller or route handler.
 *
 * @param middleware - Middleware classes or functions to apply
 * @returns Class decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * @UseMiddleware(LoggerMiddleware, AuthMiddleware)
 * class UserController {
 *   @Get()
 *   findAll() {
 *     return 'This will pass through middleware';
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * const loggerMiddleware: MiddlewareFunction = (req, res, next) => {
 *   console.log('Request:', req.method, req.url);
 *   next();
 * };
 *
 * @Controller('users')
 * @UseMiddleware(loggerMiddleware)
 * class UserController {}
 * ```
 */
export function UseMiddleware(
	...middleware: Array<Type<DwexMiddleware> | MiddlewareFunction>
): ClassDecorator {
	return (target: Function) => {
		Reflect.defineMetadata(MIDDLEWARE_METADATA, middleware, target);
	};
}
