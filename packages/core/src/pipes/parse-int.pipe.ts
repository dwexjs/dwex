import {
	type ArgumentMetadata,
	BadRequestException,
	type PipeTransform,
} from "@dwex/common";
import { Injectable } from "../di/injectable.decorator.js";

/**
 * Pipe that transforms a string to an integer.
 * Throws BadRequestException if the value cannot be parsed.
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Get(':id')
 *   findOne(@Param('id', ParseIntPipe) id: number) {
 *     return { id };
 *   }
 * }
 * ```
 */
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
	/**
	 * Transforms a string value to an integer.
	 *
	 * @param value - The value to transform
	 * @param metadata - Argument metadata
	 * @returns The parsed integer
	 * @throws BadRequestException if parsing fails
	 */
	transform(value: string, metadata: ArgumentMetadata): number {
		const val = Number.parseInt(value, 10);

		if (Number.isNaN(val)) {
			throw new BadRequestException(
				`Validation failed (numeric string is expected)`,
			);
		}

		return val;
	}
}
