import { Injectable } from "@dwex/core";

@Injectable()
export class ProductsService {
	getProducts() {
		return [
			{ id: 1, name: "Product 1" },
			{ id: 2, name: "Product 2" },
		];
	}
}
