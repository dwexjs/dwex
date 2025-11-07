import "reflect-metadata";
import {
	PIPES_METADATA,
	type PipeTransform,
	type Type,
} from "@dwex/common";

/**
 * Applies pipes to a route handler, controller, or parameter.
 * Pipes transform and validate route handler arguments.
 *
 * @param pipes - Pipe classes or instances to apply
 * @returns Method, Class, or Parameter decorator
 *
 * @example
 * ```typescript
 * // Apply to entire controller
 * @Controller('users')
 * @UsePipes(ValidationPipe)
 * class UserController {
 *   @Post()
 *   create(@Body() createDto: CreateUserDto) {
 *     return createDto;
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Apply to specific route
 * @Controller('users')
 * class UserController {
 *   @Post()
 *   @UsePipes(ValidationPipe)
 *   create(@Body() createDto: CreateUserDto) {
 *     return createDto;
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Apply to specific parameter
 * @Controller('users')
 * class UserController {
 *   @Get(':id')
 *   findOne(@Param('id', ParseIntPipe) id: number) {
 *     return { id };
 *   }
 * }
 * ```
 */
export function UsePipes(
	...pipes: Array<Type<PipeTransform> | PipeTransform>
): MethodDecorator & ClassDecorator {
	return (
		target: any,
		propertyKey?: string | symbol,
		descriptor?: PropertyDescriptor,
	) => {
		if (descriptor) {
			// Method decorator
			Reflect.defineMetadata(PIPES_METADATA, pipes, descriptor.value);
			return descriptor;
		}
		// Class decorator
		Reflect.defineMetadata(PIPES_METADATA, pipes, target);
		return target;
	};
}
