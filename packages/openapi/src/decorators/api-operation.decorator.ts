import "reflect-metadata";
import { API_OPERATION } from "@dwex/common";
import type { ApiOperationMetadata } from "../interfaces/index.js";

/**
 * Defines metadata for an API operation in Swagger documentation.
 *
 * @param options - Operation metadata
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Get(':id')
 *   @ApiOperation({
 *     summary: 'Get user by ID',
 *     description: 'Returns a single user by their ID',
 *     operationId: 'getUserById'
 *   })
 *   findOne(@Param('id') id: string) {
 *     return { id };
 *   }
 * }
 * ```
 */
export function ApiOperation(options: ApiOperationMetadata): MethodDecorator {
	return (
		target: object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor,
	) => {
		Reflect.defineMetadata(API_OPERATION, options, descriptor.value);
		return descriptor;
	};
}
