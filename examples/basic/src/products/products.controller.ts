import {
	Body,
	Controller,
	DefaultValuePipe,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	UsePipes,
} from "@dwex/core";
import type { CreateProductDto, UpdateProductDto } from "./product.dto";
import { ProductValidationPipe } from "./validation.pipe";

interface Product {
	id: number;
	name: string;
	price: number;
	description?: string;
	inStock: boolean;
}

/**
 * Products controller demonstrating various pipe usages
 */
@Controller("products")
export class ProductsController {
	private products: Product[] = [
		{ id: 1, name: "Laptop", price: 999.99, inStock: true },
		{
			id: 2,
			name: "Mouse",
			price: 29.99,
			description: "Wireless mouse",
			inStock: true,
		},
		{ id: 3, name: "Keyboard", price: 79.99, inStock: false },
	];

	/**
	 * Get all products with optional filtering and pagination
	 * Demonstrates ParseIntPipe, ParseBoolPipe, and DefaultValuePipe
	 */
	@Get()
	findAll(
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
		@Query("inStock", new DefaultValuePipe(undefined)) inStock?: string,
	) {
		let filtered = [...this.products];

		// Filter by stock if provided
		if (inStock !== undefined) {
			const inStockBool = inStock === "true";
			filtered = filtered.filter((p) => p.inStock === inStockBool);
		}

		// Pagination
		const start = (page - 1) * limit;
		const end = start + limit;
		const paginated = filtered.slice(start, end);

		return {
			data: paginated,
			meta: {
				page,
				limit,
				total: filtered.length,
				totalPages: Math.ceil(filtered.length / limit),
			},
		};
	}

	/**
	 * Get a single product by ID
	 * Demonstrates ParseIntPipe on route parameter
	 */
	@Get(":id")
	findOne(@Param("id", ParseIntPipe) id: number) {
		const product = this.products.find((p) => p.id === id);

		if (!product) {
			return { error: "Product not found" };
		}

		return product;
	}

	/**
	 * Create a new product
	 * Demonstrates custom validation pipe on request body
	 */
	@Post()
	@UsePipes(ProductValidationPipe)
	create(@Body() createProductDto: CreateProductDto) {
		const newProduct: Product = {
			id: this.products.length + 1,
			name: createProductDto.name,
			price: createProductDto.price,
			description: createProductDto.description,
			inStock: createProductDto.inStock,
		};

		this.products.push(newProduct);
		return newProduct;
	}

	/**
	 * Update a product
	 * Demonstrates combining ParseIntPipe with custom validation
	 */
	@Put(":id")
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body(ProductValidationPipe) updateProductDto: UpdateProductDto,
	) {
		const product = this.products.find((p) => p.id === id);

		if (!product) {
			return { error: "Product not found" };
		}

		Object.assign(product, updateProductDto);
		return product;
	}

	/**
	 * Delete a product
	 * Demonstrates ParseIntPipe on route parameter
	 */
	@Delete(":id")
	remove(@Param("id", ParseIntPipe) id: number) {
		const index = this.products.findIndex((p) => p.id === id);

		if (index === -1) {
			return { error: "Product not found" };
		}

		const deleted = this.products.splice(index, 1);
		return { message: "Product deleted", product: deleted[0] };
	}

	/**
	 * Search products by price range
	 * Demonstrates multiple pipes on query parameters
	 */
	@Get("search/by-price")
	searchByPrice(
		@Query("min", new DefaultValuePipe(0), ParseIntPipe) min: number,
		@Query("max", new DefaultValuePipe(Number.MAX_SAFE_INTEGER), ParseIntPipe)
		max: number,
	) {
		const results = this.products.filter(
			(p) => p.price >= min && p.price <= max,
		);

		return {
			min,
			max,
			count: results.length,
			products: results,
		};
	}
}
