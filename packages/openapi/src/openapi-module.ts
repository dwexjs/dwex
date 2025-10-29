import "reflect-metadata";
import { RequestMethod, ROUTE_PARAMS } from "@dwex/common";
import type { DwexApplication } from "@dwex/core";
import { ParamType } from "@dwex/core";
import type { OpenAPIObject } from "openapi3-ts/oas31";
import type { OpenApiOptions } from "./interfaces/index.js";
import { generateScalarHTML } from "./templates/scalar.template.js";

/**
 * Module for setting up Swagger/OpenAPI documentation in a Dwex application.
 *
 * @example
 * ```typescript
 * const app = await DwexFactory.create(AppModule);
 *
 * const config = new DocumentBuilder()
 *   .setTitle('My API')
 *   .setVersion('1.0')
 *   .build();
 *
 * const document = OpenApiModule.createDocument(app, config);
 * OpenApiModule.setup('/docs', app, document);
 *
 * await app.listen(9929);
 * // Docs available at: http://localhost:9929/docs
 * ```
 */
export class OpenApiModule {
	/**
	 * Sets up Swagger documentation on a Dwex application.
	 *
	 * This creates two routes:
	 * 1. GET {path} - Serves the Scalar UI HTML
	 * 2. GET {path}/json - Returns the OpenAPI JSON spec
	 *
	 * @param path - The path where the documentation will be served (default: '/docs')
	 * @param app - The Dwex application instance
	 * @param document - The OpenAPI document
	 * @param options - Optional Swagger UI configuration
	 *
	 * @example
	 * ```typescript
	 * OpenApiModule.setup('/api-docs', app, document, {
	 *   customSiteTitle: 'My API Docs',
	 *   darkMode: true
	 * });
	 * ```
	 */
	static setup(
		path: string,
		app: DwexApplication,
		document: OpenAPIObject,
		options: OpenApiOptions = {},
	): void {
		// Normalize path
		const normalizedPath = path.startsWith("/") ? path : `/${path}`;
		const basePath = normalizedPath.replace(/\/$/, "");

		// Generate HTML
		const html = generateScalarHTML(document, options);

		// Get the router
		const router = app.getRouter();

		// Create a mock controller for Swagger routes
		const swaggerController = {
			constructor: {
				name: "SwaggerController",
			},
		};

		// Register JSON endpoint
		const jsonPath = `${basePath}/json`;
		const jsonHandler = () => document;

		router.getRoutes().push({
			path: jsonPath,
			method: RequestMethod.GET,
			handler: jsonHandler,
			controller: swaggerController,
			params: [],
			guards: [],
			interceptors: [],
		});

		// Register HTML endpoint with @Res() decorator pattern
		const htmlHandler = function (this: any, res: any) {
			res.setHeader("Content-Type", "text/html; charset=utf-8");
			res.status(200);
			res.send(html);
		};

		// Add @Res() metadata to the handler
		Reflect.defineMetadata(
			ROUTE_PARAMS,
			[{ index: 0, type: ParamType.RESPONSE }],
			htmlHandler,
		);

		router.getRoutes().push({
			path: basePath,
			method: RequestMethod.GET,
			handler: htmlHandler,
			controller: swaggerController,
			params: [],
			guards: [],
			interceptors: [],
		});
	}

	/**
	 * Creates an OpenAPI document from a Dwex application.
	 *
	 * This is a convenience method that delegates to DocumentFactory.createDocument.
	 *
	 * @param app - The Dwex application instance
	 * @param config - OpenAPI document configuration from DocumentBuilder
	 * @returns Complete OpenAPI document
	 *
	 * @example
	 * ```typescript
	 * const document = OpenApiModule.createDocument(app, config);
	 * ```
	 */
	static createDocument(
		app: DwexApplication,
		config: Omit<OpenAPIObject, "paths">,
	): OpenAPIObject {
		// Import DocumentFactory dynamically to avoid circular dependencies
		const { DocumentFactory } = require("./document-factory.js");
		return DocumentFactory.createDocument(app, config);
	}
}
