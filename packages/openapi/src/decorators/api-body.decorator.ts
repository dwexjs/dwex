import "reflect-metadata";
import { API_BODY } from "@dwex/common";
import type { ApiBodyMetadata } from "../interfaces/index.js";

/**
 * Defines metadata for a request body in Swagger documentation.
 *
 * @param options - Request body metadata
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * class CreateUserDto {
 *   @ApiProperty({ description: 'Username' })
 *   username: string;
 *
 *   @ApiProperty({ description: 'Email address' })
 *   email: string;
 * }
 *
 * @Controller('users')
 * class UserController {
 *   @Post()
 *   @ApiBody({ description: 'User creation data', type: CreateUserDto })
 *   create(@Body() dto: CreateUserDto) {
 *     return dto;
 *   }
 * }
 * ```
 */
export function ApiBody(options: ApiBodyMetadata): MethodDecorator {
	return (
		target: object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor,
	) => {
		Reflect.defineMetadata(API_BODY, options, descriptor.value);
		return descriptor;
	};
}
