import "reflect-metadata";
import {
	API_BODY,
	API_OPERATION,
	API_PARAM,
	API_QUERY,
	API_RESPONSE,
	API_SECURITY,
	API_TAGS,
	CONTROLLER_PATH,
	ROUTE_PARAMS,
} from "@dwex/common";
import type { Route } from "@dwex/core";
import type {
	OperationObject,
	ParameterObject,
	PathItemObject,
	PathsObject,
	RequestBodyObject,
	ResponseObject,
	ResponsesObject,
	SchemaObject,
} from "openapi3-ts/oas31";
import type {
	ApiBodyMetadata,
	ApiOperationMetadata,
	ApiParamMetadata,
	ApiQueryMetadata,
	ApiResponseMetadata,
	ApiSecurityMetadata,
} from "../interfaces/index.js";
import { SchemaExplorer } from "./schema-explorer.js";

/**
 * Explores routes and generates OpenAPI paths.
 */
export class RouteExplorer {
	private readonly schemaExplorer = new SchemaExplorer();

	/**
	 * Explores routes and generates OpenAPI paths object.
	 *
	 * @param routes - Array of routes from the router
	 * @returns OpenAPI paths object
	 */
	explorePaths(routes: Route[]): PathsObject {
		const paths: PathsObject = {};

		for (const route of routes) {
			const path = this.convertPathToOpenAPI(route.path);

			if (!paths[path]) {
				paths[path] = {};
			}

			const method = route.method.toLowerCase();
			const pathItem = paths[path] as PathItemObject;

			// Create operation for this route
			const operation = this.createOperation(route);

			// @ts-ignore - Dynamic method assignment
			pathItem[method] = operation;
		}

		return paths;
	}

	/**
	 * Gets all generated schemas.
	 *
	 * @returns Map of schema names to schema objects
	 */
	getAllSchemas(): Record<string, SchemaObject> {
		return this.schemaExplorer.getAllSchemas();
	}

	/**
	 * Converts Dwex path format to OpenAPI format.
	 *
	 * @param path - Dwex path (e.g., /users/:id)
	 * @returns OpenAPI path (e.g., /users/{id})
	 */
	private convertPathToOpenAPI(path: string): string {
		return path.replace(/:([^/]+)/g, "{$1}");
	}

	/**
	 * Creates an operation object for a route.
	 *
	 * @param route - The route to create an operation for
	 * @returns The operation object
	 */
	private createOperation(route: Route): OperationObject {
		const operation: OperationObject = {
			responses: {},
		};

		// Get controller class
		const controllerClass = route.controller.constructor;

		// Get tags from controller or method
		const controllerTags: string[] =
			Reflect.getMetadata(API_TAGS, controllerClass) || [];
		const methodTags: string[] =
			Reflect.getMetadata(API_TAGS, route.handler) || [];
		const tags = [...controllerTags, ...methodTags];

		if (tags.length > 0) {
			operation.tags = tags;
		} else {
			// Default tag from controller name
			const controllerPath =
				Reflect.getMetadata(CONTROLLER_PATH, controllerClass) ||
				controllerClass.name.replace(/Controller$/, "");
			if (controllerPath) {
				operation.tags = [controllerPath];
			}
		}

		// Get operation metadata
		const operationMetadata: ApiOperationMetadata | undefined =
			Reflect.getMetadata(API_OPERATION, route.handler);

		if (operationMetadata) {
			if (operationMetadata.summary)
				operation.summary = operationMetadata.summary;
			if (operationMetadata.description)
				operation.description = operationMetadata.description;
			if (operationMetadata.operationId)
				operation.operationId = operationMetadata.operationId;
			if (operationMetadata.deprecated)
				operation.deprecated = operationMetadata.deprecated;
		}

		// Get parameters (path params and query params)
		operation.parameters = this.getParameters(route);

		// Get request body
		const requestBody = this.getRequestBody(route);
		if (requestBody) {
			operation.requestBody = requestBody;
		}

		// Get responses
		operation.responses = this.getResponses(route);

		// Get security requirements
		const security = this.getSecurity(route);
		if (security && security.length > 0) {
			operation.security = security;
		}

		return operation;
	}

	/**
	 * Gets parameters for a route.
	 *
	 * @param route - The route
	 * @returns Array of parameter objects
	 */
	private getParameters(route: Route): ParameterObject[] {
		const parameters: ParameterObject[] = [];

		// Get path parameters from route
		const pathParams = route.params || [];

		// Get ApiParam metadata
		const apiParams: ApiParamMetadata[] =
			Reflect.getMetadata(API_PARAM, route.handler) || [];

		// Add path parameters
		for (const param of pathParams) {
			const apiParam = apiParams.find((p) => p.name === param.name);

			const parameter: ParameterObject = {
				name: param.name,
				in: "path",
				required: true,
				schema: apiParam?.schema || { type: "string" },
			};

			if (apiParam?.description) {
				parameter.description = apiParam.description;
			}

			if (apiParam?.example !== undefined) {
				parameter.example = apiParam.example;
			}

			parameters.push(parameter);
		}

		// Get ApiQuery metadata
		const apiQueries: ApiQueryMetadata[] =
			Reflect.getMetadata(API_QUERY, route.handler) || [];

		// Add query parameters
		for (const query of apiQueries) {
			const schema =
				query.schema ||
				this.schemaExplorer.getOrCreateSchema(query.type, query.isArray);

			const parameter: ParameterObject = {
				name: query.name,
				in: "query",
				required: query.required || false,
				schema,
			};

			if (query.description) {
				parameter.description = query.description;
			}

			if (query.example !== undefined) {
				parameter.example = query.example;
			}

			parameters.push(parameter);
		}

		return parameters;
	}

	/**
	 * Gets request body for a route.
	 *
	 * @param route - The route
	 * @returns Request body object or undefined
	 */
	private getRequestBody(route: Route): RequestBodyObject | undefined {
		// Get ApiBody metadata
		const apiBody: ApiBodyMetadata | undefined = Reflect.getMetadata(
			API_BODY,
			route.handler,
		);

		if (!apiBody) {
			// Check if there's a @Body() decorator in route params
			const routeParams =
				Reflect.getMetadata(ROUTE_PARAMS, route.handler) || [];
			const hasBody = routeParams.some((p: any) => p.type === "body");

			if (!hasBody) {
				return undefined;
			}

			// Create a default request body
			return {
				required: true,
				content: {
					"application/json": {
						schema: { type: "object" },
					},
				},
			};
		}

		const schema =
			apiBody.schema ||
			this.schemaExplorer.getOrCreateSchema(apiBody.type, apiBody.isArray);

		const requestBody: RequestBodyObject = {
			required: apiBody.required !== false,
			content: {
				"application/json": {
					schema,
				},
			},
		};

		if (apiBody.description) {
			requestBody.description = apiBody.description;
		}

		return requestBody;
	}

	/**
	 * Gets responses for a route.
	 *
	 * @param route - The route
	 * @returns Responses object
	 */
	private getResponses(route: Route): ResponsesObject {
		// Get ApiResponse metadata
		const apiResponses: ApiResponseMetadata[] =
			Reflect.getMetadata(API_RESPONSE, route.handler) || [];

		const responses: ResponsesObject = {};

		if (apiResponses.length > 0) {
			for (const apiResponse of apiResponses) {
				const statusCode = String(apiResponse.status);

				const response: ResponseObject = {
					description:
						apiResponse.description ||
						this.getDefaultDescription(apiResponse.status),
				};

				if (apiResponse.type || apiResponse.schema) {
					const schema =
						apiResponse.schema ||
						this.schemaExplorer.getOrCreateSchema(
							apiResponse.type,
							apiResponse.isArray,
						);

					response.content = {
						"application/json": {
							schema,
						},
					};
				}

				responses[statusCode] = response;
			}
		} else {
			// Default response
			responses["200"] = {
				description: "Successful response",
				content: {
					"application/json": {
						schema: { type: "object" },
					},
				},
			};
		}

		// Add 401 response if guards are present
		const guards = route.guards || [];
		if (guards.length > 0 && !responses["401"]) {
			responses["401"] = {
				description: "Unauthorized",
			};
		}

		return responses;
	}

	/**
	 * Gets default description for a status code.
	 *
	 * @param status - HTTP status code
	 * @returns Default description
	 */
	private getDefaultDescription(status: number | string): string {
		const statusCode = Number(status);

		switch (statusCode) {
			case 200:
				return "OK";
			case 201:
				return "Created";
			case 204:
				return "No Content";
			case 400:
				return "Bad Request";
			case 401:
				return "Unauthorized";
			case 403:
				return "Forbidden";
			case 404:
				return "Not Found";
			case 500:
				return "Internal Server Error";
			default:
				return "Response";
		}
	}

	/**
	 * Gets security requirements for a route.
	 *
	 * @param route - The route
	 * @returns Security requirements array
	 */
	private getSecurity(
		route: Route,
	): Array<Record<string, string[]>> | undefined {
		const controllerClass = route.controller.constructor;

		// Get security from controller or method
		const controllerSecurity: ApiSecurityMetadata[] =
			Reflect.getMetadata(API_SECURITY, controllerClass) || [];
		const methodSecurity: ApiSecurityMetadata[] =
			Reflect.getMetadata(API_SECURITY, route.handler) || [];

		const allSecurity = [...controllerSecurity, ...methodSecurity];

		if (allSecurity.length === 0) {
			return undefined;
		}

		return allSecurity.map((sec) => ({
			[sec.name]: sec.scopes || [],
		}));
	}
}
