import "reflect-metadata";
import { API_TAGS } from "@dwex/common";

/**
 * Defines tags for grouping API operations in Swagger documentation.
 *
 * @param tags - Tags to assign to the controller or method
 * @returns Class or Method decorator
 *
 * @example
 * ```typescript
 * @ApiTags('users', 'authentication')
 * @Controller('users')
 * class UserController {
 *   @Get()
 *   findAll() {
 *     return [];
 *   }
 * }
 * ```
 */
export function ApiTags(...tags: string[]): ClassDecorator & MethodDecorator {
	return (
		target: object | Function,
		propertyKey?: string | symbol,
		descriptor?: PropertyDescriptor,
	) => {
		if (propertyKey && descriptor) {
			// Method decorator
			Reflect.defineMetadata(API_TAGS, tags, descriptor.value);
		} else {
			// Class decorator
			Reflect.defineMetadata(API_TAGS, tags, target);
		}
	};
}
