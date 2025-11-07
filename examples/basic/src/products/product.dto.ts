/**
 * DTO for creating a product
 */
export class CreateProductDto {
	name!: string;
	price!: number;
	description?: string;
	inStock!: boolean;
}

/**
 * DTO for updating a product
 */
export class UpdateProductDto {
	name?: string;
	price?: number;
	description?: string;
	inStock?: boolean;
}
