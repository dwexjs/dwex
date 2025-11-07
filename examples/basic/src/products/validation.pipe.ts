import {
	type ArgumentMetadata,
	BadRequestException,
	Injectable,
	type PipeTransform,
} from "@dwex/core";

/**
 * Custom validation pipe that validates product data
 */
@Injectable()
export class ProductValidationPipe implements PipeTransform {
	transform(value: any, metadata: ArgumentMetadata) {
		if (metadata.type === "body" && value) {
			// Validate product name
			if (value.name && typeof value.name !== "string") {
				throw new BadRequestException("Product name must be a string");
			}

			if (value.name && value.name.length < 3) {
				throw new BadRequestException(
					"Product name must be at least 3 characters",
				);
			}

			// Validate product price
			if (value.price !== undefined) {
				const price = Number(value.price);
				if (Number.isNaN(price) || price <= 0) {
					throw new BadRequestException(
						"Product price must be a positive number",
					);
				}
			}

			// Validate inStock
			if (value.inStock !== undefined && typeof value.inStock !== "boolean") {
				throw new BadRequestException("inStock must be a boolean");
			}
		}

		return value;
	}
}
