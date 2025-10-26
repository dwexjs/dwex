import type { DwexApplication } from "@dwex/core";
import type { OpenAPIObject } from "openapi3-ts/oas31";
import { RouteExplorer } from "./explorers/index.js";

/**
 * Factory for creating OpenAPI documents from Dwex applications.
 */
export class DocumentFactory {
	/**
	 * Creates an OpenAPI document from a Dwex application.
	 *
	 * @param app - The Dwex application instance
	 * @param config - OpenAPI document configuration from DocumentBuilder
	 * @returns Complete OpenAPI document
	 *
	 * @example
	 * ```typescript
	 * const app = await DwexFactory.create(AppModule);
	 * const config = new DocumentBuilder()
	 *   .setTitle('My API')
	 *   .setVersion('1.0')
	 *   .build();
	 *
	 * const document = DocumentFactory.createDocument(app, config);
	 * ```
	 */
	static createDocument(
		app: DwexApplication,
		config: Omit<OpenAPIObject, "paths">,
	): OpenAPIObject {
		const router = app.getRouter();
		const routes = router.getRoutes();

		// Create route explorer
		const routeExplorer = new RouteExplorer();

		// Explore paths
		const paths = routeExplorer.explorePaths(routes);

		// Get all schemas
		const schemas = routeExplorer.getAllSchemas();

		// Merge config with generated content
		const document: OpenAPIObject = {
			...config,
			paths,
			components: {
				...config.components,
				schemas: {
					...(config.components?.schemas || {}),
					...schemas,
				},
			},
		};

		return document;
	}
}
