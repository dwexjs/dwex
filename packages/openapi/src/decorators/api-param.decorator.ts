import "reflect-metadata";
import { API_PARAM } from "@dwex/common";
import type { ApiParamMetadata } from "../interfaces/index.js";

/**
 * Defines metadata for a path parameter in Swagger documentation.
 *
 * @param options - Parameter metadata
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Get(':id')
 *   @ApiParam({ name: 'id', description: 'User ID', type: String })
 *   findOne(@Param('id') id: string) {
 *     return { id };
 *   }
 * }
 * ```
 */
export function ApiParam(options: ApiParamMetadata): MethodDecorator {
	return (
		target: object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor,
	) => {
		const existingParams: ApiParamMetadata[] =
			Reflect.getMetadata(API_PARAM, descriptor.value) || [];

		existingParams.push(options);

		Reflect.defineMetadata(API_PARAM, existingParams, descriptor.value);
		return descriptor;
	};
}
