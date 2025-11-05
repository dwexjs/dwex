import { Injectable } from "@dwex/core";
import { ProductsService } from "../products/products.service";

@Injectable()
export class UsersService {
	constructor(private productsService: ProductsService) {}

	getUserWithProducts(userId: number) {
		return {
			id: userId,
			name: "User " + userId,
			products: this.productsService.getProducts(),
		};
	}
}
