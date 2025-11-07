import { Module } from "@dwex/core";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { ProductValidationPipe } from "./validation.pipe";

/**
 * Products module demonstrating pipe usage
 */
@Module({
	controllers: [ProductsController],
	providers: [ProductsService, ProductValidationPipe],
	exports: [ProductsService],
})
export class ProductsModule {}
