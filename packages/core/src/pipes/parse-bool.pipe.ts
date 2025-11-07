import {
	type ArgumentMetadata,
	BadRequestException,
	type PipeTransform,
} from "@dwex/common";
import { Injectable } from "../di/injectable.decorator.js";

/**
 * Pipe that transforms a string to a boolean.
 * Accepts: 'true', 'false', '1', '0' (case-insensitive)
 * Throws BadRequestException if the value cannot be parsed.
 *
 * @example
 * ```typescript
 * @Controller('settings')
 * class SettingsController {
 *   @Get()
 *   findAll(@Query('enabled', ParseBoolPipe) enabled: boolean) {
 *     return { enabled };
 *   }
 * }
 * ```
 */
@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
	/**
	 * Transforms a string value to a boolean.
	 *
	 * @param value - The value to transform
	 * @param metadata - Argument metadata
	 * @returns The parsed boolean
	 * @throws BadRequestException if parsing fails
	 */
	transform(value: string, metadata: ArgumentMetadata): boolean {
		if (typeof value === "boolean") {
			return value;
		}

		if (typeof value === "string") {
			const lowerValue = value.toLowerCase();

			if (lowerValue === "true" || lowerValue === "1") {
				return true;
			}
			if (lowerValue === "false" || lowerValue === "0") {
				return false;
			}
		}

		throw new BadRequestException(
			`Validation failed (boolean string is expected)`,
		);
	}
}
