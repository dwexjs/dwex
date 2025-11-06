import { describe, it, expect, beforeEach } from "vitest";
import { Module } from "../decorators/module.decorator.js";
import { Injectable } from "./injectable.decorator.js";
import { Container } from "./container.js";
import { ModuleContainer } from "./module-container.js";

// Helper to set constructor param types metadata for Bun/Vitest compatibility
// Bun doesn't emit decorator metadata automatically for classes defined in test files
function setParamTypes(target: any, paramTypes: any[]): void {
	Reflect.defineMetadata("design:paramtypes", paramTypes, target);
}

describe("Module Encapsulation", () => {
	let container: Container;
	let moduleContainer: ModuleContainer;

	beforeEach(() => {
		container = new Container();
		moduleContainer = new ModuleContainer();
		container.setModuleContainer(moduleContainer);
	});

	describe("Basic provider isolation", () => {
		it("should not allow access to non-exported providers", () => {
			@Injectable()
			class ProductsService {
				getName() {
					return "Products";
				}
			}

			@Module({
				providers: [ProductsService],
				exports: [], // Not exported
			})
			class ProductsModule {}

			@Injectable()
			class UsersService {
				constructor(private products: ProductsService) {}
			}
			setParamTypes(UsersService, [ProductsService]);

			@Module({
				imports: [ProductsModule],
				providers: [UsersService],
			})
			class UsersModule {}

			// Build module graph
			const productsModuleRef = moduleContainer.addModule(ProductsModule);
			const usersModuleRef = moduleContainer.addModule(UsersModule);

			// Add providers to their modules
			productsModuleRef.addProvider(ProductsService);
			usersModuleRef.addProvider(UsersService);

			// Add to global container
			container.addProvider(ProductsService);
			container.addProvider(UsersService);

			// Map providers to their modules
			container.setProviderModule(ProductsService, productsModuleRef);
			container.setProviderModule(UsersService, usersModuleRef);

			// Setup module imports
			usersModuleRef.addImport(productsModuleRef);

			// Try to get UsersService - should fail because ProductsService is not exported
			expect(() => {
				container.get(UsersService, false, usersModuleRef);
			}).toThrow();
		});

		it("should allow access to exported providers", () => {
			@Injectable()
			class ProductsService {
				getName() {
					return "Products";
				}
			}

			@Module({
				providers: [ProductsService],
				exports: [ProductsService], // Exported
			})
			class ProductsModule {}

			@Injectable()
			class UsersService {
				constructor(public products: ProductsService) {}
			}
			setParamTypes(UsersService, [ProductsService]);

			@Module({
				imports: [ProductsModule],
				providers: [UsersService],
			})
			class UsersModule {}

			// Build module graph
			const productsModuleRef = moduleContainer.addModule(ProductsModule);
			const usersModuleRef = moduleContainer.addModule(UsersModule);

			// Add providers to their modules
			productsModuleRef.addProvider(ProductsService);
			productsModuleRef.addExport(ProductsService);
			usersModuleRef.addProvider(UsersService);

			// Add to global container
			container.addProvider(ProductsService);
			container.addProvider(UsersService);

			// Map providers to their modules
			container.setProviderModule(ProductsService, productsModuleRef);
			container.setProviderModule(UsersService, usersModuleRef);

			// Setup module imports
			usersModuleRef.addImport(productsModuleRef);

			// Get UsersService - should succeed
			const usersService = container.get<UsersService>(
				UsersService,
				false,
				usersModuleRef,
			);
			expect(usersService).toBeDefined();
			expect(usersService.products).toBeDefined();
			expect(usersService.products.getName()).toBe("Products");
		});
	});

	describe("Global modules", () => {
		it("should make global module providers available everywhere", () => {
			@Injectable()
			class ConfigService {
				getConfig() {
					return { api: "localhost" };
				}
			}

			@Module({
				providers: [ConfigService],
				exports: [ConfigService],
			})
			class ConfigModule {}

			@Injectable()
			class UsersService {
				constructor(public config: ConfigService) {}
			}
			setParamTypes(UsersService, [ConfigService]);

			@Module({
				// Not importing ConfigModule
				providers: [UsersService],
			})
			class UsersModule {}

			// Build module graph - mark ConfigModule as global
			const configModuleRef = moduleContainer.addModule(ConfigModule);
			const usersModuleRef = moduleContainer.addModule(UsersModule);

			// Manually mark as global for this test
			moduleContainer.markAsGlobal(configModuleRef);

			// Add providers
			configModuleRef.addProvider(ConfigService);
			configModuleRef.addExport(ConfigService);
			usersModuleRef.addProvider(UsersService);

			container.addProvider(ConfigService);
			container.addProvider(UsersService);

			// Map providers to their modules
			container.setProviderModule(ConfigService, configModuleRef);
			container.setProviderModule(UsersService, usersModuleRef);

			// Get UsersService - should succeed even without import
			const usersService = container.get<UsersService>(
				UsersService,
				false,
				usersModuleRef,
			);
			expect(usersService).toBeDefined();
			expect(usersService.config).toBeDefined();
			expect(usersService.config.getConfig().api).toBe("localhost");
		});
	});

	describe("Error messages", () => {
		it("should provide helpful error when provider not found in module", () => {
			@Injectable()
			class ProductsService {}

			@Injectable()
			class UsersService {
				constructor(private products: ProductsService) {}
			}
			setParamTypes(UsersService, [ProductsService]);

			@Module({
				providers: [ProductsService],
			})
			class ProductsModule {}

			@Module({
				providers: [UsersService],
			})
			class UsersModule {}

			// Build module graph
			const productsModuleRef = moduleContainer.addModule(ProductsModule);
			const usersModuleRef = moduleContainer.addModule(UsersModule);

			productsModuleRef.addProvider(ProductsService);
			usersModuleRef.addProvider(UsersService);

			container.addProvider(ProductsService);
			container.addProvider(UsersService);

			// Map providers to their modules
			container.setProviderModule(ProductsService, productsModuleRef);
			container.setProviderModule(UsersService, usersModuleRef);

			// Try to get UsersService
			expect(() => {
				container.get(UsersService, false, usersModuleRef);
			}).toThrow(/ProductsService/);
		});
	});

	describe("Module resolution chain", () => {
		it("should resolve through module import chain", () => {
			@Injectable()
			class DatabaseService {}

			@Module({
				providers: [DatabaseService],
				exports: [DatabaseService],
			})
			class DatabaseModule {}

			@Injectable()
			class ProductsService {
				constructor(public db: DatabaseService) {}
			}
			setParamTypes(ProductsService, [DatabaseService]);

			@Module({
				imports: [DatabaseModule],
				providers: [ProductsService],
				exports: [ProductsService],
			})
			class ProductsModule {}

			@Injectable()
			class UsersService {
				constructor(public products: ProductsService) {}
			}
			setParamTypes(UsersService, [ProductsService]);

			@Module({
				imports: [ProductsModule],
				providers: [UsersService],
			})
			class UsersModule {}

			// Build module graph
			const dbModuleRef = moduleContainer.addModule(DatabaseModule);
			const productsModuleRef = moduleContainer.addModule(ProductsModule);
			const usersModuleRef = moduleContainer.addModule(UsersModule);

			dbModuleRef.addProvider(DatabaseService);
			dbModuleRef.addExport(DatabaseService);

			productsModuleRef.addProvider(ProductsService);
			productsModuleRef.addExport(ProductsService);
			productsModuleRef.addImport(dbModuleRef);

			usersModuleRef.addProvider(UsersService);
			usersModuleRef.addImport(productsModuleRef);

			container.addProvider(DatabaseService);
			container.addProvider(ProductsService);
			container.addProvider(UsersService);

			// Map providers to their modules
			container.setProviderModule(DatabaseService, dbModuleRef);
			container.setProviderModule(ProductsService, productsModuleRef);
			container.setProviderModule(UsersService, usersModuleRef);

			// Get UsersService
			const usersService = container.get<UsersService>(
				UsersService,
				false,
				usersModuleRef,
			);
			expect(usersService).toBeDefined();
			expect(usersService.products).toBeDefined();
			expect(usersService.products.db).toBeDefined();
		});
	});
});
