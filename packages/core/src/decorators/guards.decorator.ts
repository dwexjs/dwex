import "reflect-metadata";
import { type CanActivate, GUARDS_METADATA, type Type } from "@dwex/common";

/**
 * Applies guards to a route handler or controller.
 * Guards determine whether a request should be handled by the route handler.
 *
 * @param guards - Guard classes to apply
 * @returns Method or Class decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * @UseGuards(AuthGuard)
 * class UserController {
 *   @Get()
 *   findAll() {
 *     return 'This requires authentication';
 *   }
 *
 *   @Get('admin')
 *   @UseGuards(AdminGuard)
 *   adminOnly() {
 *     return 'This requires admin role';
 *   }
 * }
 * ```
 */
export function UseGuards(
  ...guards: Array<Type<CanActivate>>
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata(GUARDS_METADATA, guards, descriptor.value);
      return descriptor;
    }
    // Class decorator
    Reflect.defineMetadata(GUARDS_METADATA, guards, target);
    return target;
  };
}
