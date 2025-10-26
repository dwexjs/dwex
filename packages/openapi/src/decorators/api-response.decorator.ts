import "reflect-metadata";
import { API_RESPONSE } from "@dwex/common";
import type { ApiResponseMetadata } from "../interfaces/index.js";

/**
 * Defines a response for an API operation in Swagger documentation.
 *
 * @param options - Response metadata
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Get(':id')
 *   @ApiResponse({ status: 200, description: 'User found', type: UserDto })
 *   @ApiResponse({ status: 404, description: 'User not found' })
 *   findOne(@Param('id') id: string) {
 *     return { id };
 *   }
 * }
 * ```
 */
export function ApiResponse(options: ApiResponseMetadata): MethodDecorator {
	return (
		target: object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor,
	) => {
		const existingResponses: ApiResponseMetadata[] =
			Reflect.getMetadata(API_RESPONSE, descriptor.value) || [];

		existingResponses.push(options);

		Reflect.defineMetadata(API_RESPONSE, existingResponses, descriptor.value);
		return descriptor;
	};
}

/**
 * Defines an OK (200) response for an API operation.
 *
 * @param options - Response metadata
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Get()
 * @ApiOkResponse({ description: 'List of users', type: [UserDto] })
 * findAll() {
 *   return [];
 * }
 * ```
 */
export function ApiOkResponse(
	options: Omit<ApiResponseMetadata, "status">,
): MethodDecorator {
	return ApiResponse({ ...options, status: 200 });
}

/**
 * Defines a Created (201) response for an API operation.
 *
 * @param options - Response metadata
 * @returns Method decorator
 */
export function ApiCreatedResponse(
	options: Omit<ApiResponseMetadata, "status">,
): MethodDecorator {
	return ApiResponse({ ...options, status: 201 });
}

/**
 * Defines a No Content (204) response for an API operation.
 *
 * @param options - Response metadata
 * @returns Method decorator
 */
export function ApiNoContentResponse(
	options?: Omit<ApiResponseMetadata, "status">,
): MethodDecorator {
	return ApiResponse({ ...options, status: 204 });
}

/**
 * Defines a Bad Request (400) response for an API operation.
 *
 * @param options - Response metadata
 * @returns Method decorator
 */
export function ApiBadRequestResponse(
	options?: Omit<ApiResponseMetadata, "status">,
): MethodDecorator {
	return ApiResponse({
		...options,
		status: 400,
		description: options?.description || "Bad Request",
	});
}

/**
 * Defines an Unauthorized (401) response for an API operation.
 *
 * @param options - Response metadata
 * @returns Method decorator
 */
export function ApiUnauthorizedResponse(
	options?: Omit<ApiResponseMetadata, "status">,
): MethodDecorator {
	return ApiResponse({
		...options,
		status: 401,
		description: options?.description || "Unauthorized",
	});
}

/**
 * Defines a Forbidden (403) response for an API operation.
 *
 * @param options - Response metadata
 * @returns Method decorator
 */
export function ApiForbiddenResponse(
	options?: Omit<ApiResponseMetadata, "status">,
): MethodDecorator {
	return ApiResponse({
		...options,
		status: 403,
		description: options?.description || "Forbidden",
	});
}

/**
 * Defines a Not Found (404) response for an API operation.
 *
 * @param options - Response metadata
 * @returns Method decorator
 */
export function ApiNotFoundResponse(
	options?: Omit<ApiResponseMetadata, "status">,
): MethodDecorator {
	return ApiResponse({
		...options,
		status: 404,
		description: options?.description || "Not Found",
	});
}

/**
 * Defines an Internal Server Error (500) response for an API operation.
 *
 * @param options - Response metadata
 * @returns Method decorator
 */
export function ApiInternalServerErrorResponse(
	options?: Omit<ApiResponseMetadata, "status">,
): MethodDecorator {
	return ApiResponse({
		...options,
		status: 500,
		description: options?.description || "Internal Server Error",
	});
}
