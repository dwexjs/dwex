import {
	type ArgumentMetadata,
	BadRequestException,
	type PipeTransform,
} from "@dwex/common";
import { Injectable } from "../di/injectable.decorator.js";

/**
 * Pipe that transforms a string to a float.
 * Throws BadRequestException if the value cannot be parsed.
 *
 * @example
 * ```typescript
 * @Controller('products')
 * class ProductController {
 *   @Get()
 *   findAll(@Query('price', ParseFloatPipe) price: number) {
 *     return { price };
 *   }
 * }
 * ```
 */
@Injectable()
export class ParseFloatPipe implements PipeTransform<string, number> {
	/**
	 * Transforms a string value to a float.
	 *
	 * @param value - The value to transform
	 * @param metadata - Argument metadata
	 * @returns The parsed float
	 * @throws BadRequestException if parsing fails
	 */
	transform(value: string, metadata: ArgumentMetadata): number {
		const val = Number.parseFloat(value);

		if (Number.isNaN(val)) {
			throw new BadRequestException(
				`Validation failed (numeric string is expected)`,
			);
		}

		return val;
	}
}
