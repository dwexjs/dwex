import { Module } from "@dwex/core";
import { ProductsModule } from "../products/products.module";
import { UsersService } from "./users.service";

@Module({
	imports: [ProductsModule],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
