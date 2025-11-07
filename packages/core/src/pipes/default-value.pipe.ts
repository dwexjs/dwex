import { type ArgumentMetadata, type PipeTransform } from "@dwex/common";
import { Injectable } from "../di/injectable.decorator.js";

/**
 * Pipe that provides a default value when the input is undefined or null.
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Get()
 *   findAll(
 *     @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
 *     @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
 *   ) {
 *     return { page, limit };
 *   }
 * }
 * ```
 */
@Injectable()
export class DefaultValuePipe<T = any, R = any> implements PipeTransform<T, R> {
	constructor(private readonly defaultValue: R) {}

	/**
	 * Returns the default value if the input is undefined or null.
	 *
	 * @param value - The value to check
	 * @param metadata - Argument metadata
	 * @returns The value or default value
	 */
	transform(value: T, metadata: ArgumentMetadata): R {
		if (value === undefined || value === null) {
			return this.defaultValue;
		}
		return value as unknown as R;
	}
}
