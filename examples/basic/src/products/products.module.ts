import { Module } from "@dwex/core";
import { ProductsService } from "./products.service";

@Module({
	providers: [ProductsService],
	exports: [ProductsService],
})
export class ProductsModule {}
