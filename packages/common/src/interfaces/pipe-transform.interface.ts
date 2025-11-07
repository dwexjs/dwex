/**
 * Metadata for pipe argument.
 */
export interface ArgumentMetadata {
	/**
	 * The type of parameter (body, query, param, custom).
	 */
	type: "body" | "query" | "param" | "custom";

	/**
	 * The metatype of the parameter (e.g., String, Number, custom DTO class).
	 */
	metatype?: new (...args: any[]) => any;

	/**
	 * The data associated with the parameter decorator (e.g., property name).
	 */
	data?: string;
}

/**
 * Interface for implementing pipes that transform and validate route handler arguments.
 *
 * Pipes have two typical use cases:
 * - **Transformation**: transform input data to the desired form (e.g., from string to integer)
 * - **Validation**: evaluate input data and if valid, pass it through unchanged; otherwise, throw an exception
 *
 * @example
 * ```typescript
 * @Injectable()
 * class ParseIntPipe implements PipeTransform<string, number> {
 *   transform(value: string, metadata: ArgumentMetadata): number {
 *     const val = parseInt(value, 10);
 *     if (isNaN(val)) {
 *       throw new BadRequestException('Validation failed');
 *     }
 *     return val;
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Injectable()
 * class ValidationPipe implements PipeTransform {
 *   async transform(value: any, metadata: ArgumentMetadata) {
 *     // Perform validation logic
 *     if (!isValid(value)) {
 *       throw new BadRequestException('Validation failed');
 *     }
 *     return value;
 *   }
 * }
 * ```
 */
export interface PipeTransform<T = any, R = any> {
	/**
	 * Method to implement a custom pipe. Called with two parameters:
	 *
	 * @param value - The currently processed argument
	 * @param metadata - Metadata about the argument
	 * @returns The transformed value or throws an exception
	 */
	transform(value: T, metadata: ArgumentMetadata): R | Promise<R>;
}
