import "reflect-metadata";
import { API_QUERY } from "@dwex/common";
import type { ApiQueryMetadata } from "../interfaces/index.js";

/**
 * Defines metadata for a query parameter in Swagger documentation.
 *
 * @param options - Query parameter metadata
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Get()
 *   @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
 *   @ApiQuery({ name: 'limit', description: 'Items per page', required: false, type: Number })
 *   findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
 *     return [];
 *   }
 * }
 * ```
 */
export function ApiQuery(options: ApiQueryMetadata): MethodDecorator {
	return (
		target: object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor,
	) => {
		const existingQueries: ApiQueryMetadata[] =
			Reflect.getMetadata(API_QUERY, descriptor.value) || [];

		existingQueries.push(options);

		Reflect.defineMetadata(API_QUERY, existingQueries, descriptor.value);
		return descriptor;
	};
}
