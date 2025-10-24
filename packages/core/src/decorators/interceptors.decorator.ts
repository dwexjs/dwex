import 'reflect-metadata';
import { INTERCEPTORS_METADATA, type DwexInterceptor, type Type } from '@dwexjs/common';

/**
 * Applies interceptors to a route handler or controller.
 * Interceptors can transform the result returned from a function,
 * or extend the basic function behavior.
 *
 * @param interceptors - Interceptor classes to apply
 * @returns Method or Class decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * @UseInterceptors(LoggingInterceptor)
 * class UserController {
 *   @Get()
 *   findAll() {
 *     return 'This will be logged';
 *   }
 *
 *   @Get(':id')
 *   @UseInterceptors(TransformInterceptor)
 *   findOne(@Param('id') id: string) {
 *     return { id };
 *   }
 * }
 * ```
 */
export function UseInterceptors(
  ...interceptors: Array<Type<DwexInterceptor>>
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata(
        INTERCEPTORS_METADATA,
        interceptors,
        descriptor.value,
      );
      return descriptor;
    }
    // Class decorator
    Reflect.defineMetadata(INTERCEPTORS_METADATA, interceptors, target);
    return target;
  };
}
