import "reflect-metadata";
import { API_PROPERTY } from "@dwex/common";
import type { ApiPropertyMetadata } from "../interfaces/index.js";

/**
 * Defines metadata for a DTO property in Swagger documentation.
 *
 * @param options - Property metadata
 * @returns Property decorator
 *
 * @example
 * ```typescript
 * class CreateUserDto {
 *   @ApiProperty({
 *     description: 'Username',
 *     example: 'john_doe',
 *     minLength: 3,
 *     maxLength: 20
 *   })
 *   username: string;
 *
 *   @ApiProperty({
 *     description: 'User age',
 *     example: 25,
 *     minimum: 18,
 *     maximum: 100
 *   })
 *   age: number;
 *
 *   @ApiProperty({
 *     description: 'User role',
 *     enum: ['admin', 'user', 'guest'],
 *     example: 'user'
 *   })
 *   role: string;
 * }
 * ```
 */
export function ApiProperty(
	options: Omit<ApiPropertyMetadata, "required"> = {},
): PropertyDecorator {
	return (target: object, propertyKey: string | symbol) => {
		const existingProperties: Record<string | symbol, ApiPropertyMetadata> =
			Reflect.getMetadata(API_PROPERTY, target.constructor) || {};

		existingProperties[propertyKey] = {
			...options,
			required: true,
		};

		Reflect.defineMetadata(
			API_PROPERTY,
			existingProperties,
			target.constructor,
		);
	};
}

/**
 * Defines metadata for an optional DTO property in Swagger documentation.
 *
 * @param options - Property metadata
 * @returns Property decorator
 *
 * @example
 * ```typescript
 * class UpdateUserDto {
 *   @ApiPropertyOptional({
 *     description: 'Username',
 *     example: 'john_doe'
 *   })
 *   username?: string;
 *
 *   @ApiPropertyOptional({
 *     description: 'Email address',
 *     example: 'john@example.com'
 *   })
 *   email?: string;
 * }
 * ```
 */
export function ApiPropertyOptional(
	options: Omit<ApiPropertyMetadata, "required"> = {},
): PropertyDecorator {
	return (target: object, propertyKey: string | symbol) => {
		const existingProperties: Record<string | symbol, ApiPropertyMetadata> =
			Reflect.getMetadata(API_PROPERTY, target.constructor) || {};

		existingProperties[propertyKey] = {
			...options,
			required: false,
		};

		Reflect.defineMetadata(
			API_PROPERTY,
			existingProperties,
			target.constructor,
		);
	};
}
