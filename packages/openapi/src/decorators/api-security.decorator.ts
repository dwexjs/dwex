import "reflect-metadata";
import { API_SECURITY } from "@dwex/common";
import type { ApiSecurityMetadata } from "../interfaces/index.js";

/**
 * Defines security requirements for an API operation in Swagger documentation.
 *
 * @param name - Security scheme name
 * @param scopes - Optional scopes required
 * @returns Class or Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * @ApiSecurity('bearer')
 * class UserController {
 *   @Get()
 *   findAll() {
 *     return [];
 *   }
 *
 *   @Get('admin')
 *   @ApiSecurity('bearer', ['admin'])
 *   adminOnly() {
 *     return { message: 'Admin area' };
 *   }
 * }
 * ```
 */
export function ApiSecurity(
	name: string,
	scopes: string[] = [],
): ClassDecorator & MethodDecorator {
	const metadata: ApiSecurityMetadata = { name, scopes };

	return (
		target: object | Function,
		propertyKey?: string | symbol,
		descriptor?: PropertyDescriptor,
	) => {
		if (propertyKey && descriptor) {
			// Method decorator
			const existingSecurity: ApiSecurityMetadata[] =
				Reflect.getMetadata(API_SECURITY, descriptor.value) || [];

			existingSecurity.push(metadata);

			Reflect.defineMetadata(API_SECURITY, existingSecurity, descriptor.value);
		} else {
			// Class decorator
			const existingSecurity: ApiSecurityMetadata[] =
				Reflect.getMetadata(API_SECURITY, target) || [];

			existingSecurity.push(metadata);

			Reflect.defineMetadata(API_SECURITY, existingSecurity, target);
		}
	};
}

/**
 * Defines Bearer token authentication requirement.
 *
 * @param scopes - Optional scopes
 * @returns Class or Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * @ApiBearerAuth()
 * class UserController {}
 * ```
 */
export function ApiBearerAuth(
	scopes: string[] = [],
): ClassDecorator & MethodDecorator {
	return ApiSecurity("bearer", scopes);
}

/**
 * Defines Basic authentication requirement.
 *
 * @returns Class or Method decorator
 */
export function ApiBasicAuth(): ClassDecorator & MethodDecorator {
	return ApiSecurity("basic", []);
}

/**
 * Defines API Key authentication requirement.
 *
 * @param name - API key scheme name
 * @returns Class or Method decorator
 */
export function ApiApiKeyAuth(
	name = "api-key",
): ClassDecorator & MethodDecorator {
	return ApiSecurity(name, []);
}
