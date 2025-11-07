import "reflect-metadata";
import {
	type ArgumentMetadata,
	BadRequestException,
	PIPES_METADATA,
	type PipeTransform,
	ROUTE_PARAMS,
} from "@dwex/common";
import {
	ParamType,
	type RouteParamMetadata,
} from "../decorators/params.decorator.js";
import type { Container } from "../di/container.js";
import { ExecutionContext } from "./execution-context.js";
import type { Route } from "./route.js";
import { extractParams, extractQuery } from "./route.js";

/**
 * Handles incoming HTTP requests and executes route handlers.
 */
export class RequestHandler {
	constructor(private readonly container: Container) {}

	/**
	 * Executes a route handler with the given request and response.
	 *
	 * @param route - The matched route
	 * @param req - The request object
	 * @param res - The response object
	 * @returns The result from the handler
	 */
	async handle(route: Route, req: any, res: any): Promise<any> {
		const executionContext = new ExecutionContext(
			req,
			res,
			route.handler,
			route.controller,
		);

		// Execute guards
		const canActivate = await this.executeGuards(
			route.guards,
			executionContext,
		);
		if (!canActivate) {
			throw new BadRequestException("Access denied");
		}

		// Extract parameters for the handler
		const args = await this.extractHandlerParams(route, req, res);

		// Execute interceptors and handler
		return await this.executeWithInterceptors(
			route.interceptors,
			executionContext,
			async () => {
				const result = await route.handler.apply(route.controller, args);
				return result;
			},
		);
	}

	/**
	 * Executes guards for a route.
	 *
	 * @param guards - Array of guard classes
	 * @param context - Execution context
	 * @returns true if all guards pass
	 */
	private async executeGuards(
		guards: any[],
		context: ExecutionContext,
	): Promise<boolean> {
		for (const GuardClass of guards) {
			const guard = this.container.get(GuardClass);
			const result = await guard.canActivate(context);

			if (!result) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Executes interceptors around the handler.
	 *
	 * @param interceptors - Array of interceptor classes
	 * @param context - Execution context
	 * @param next - The next function to execute
	 * @returns The result from the handler
	 */
	private async executeWithInterceptors(
		interceptors: any[],
		context: ExecutionContext,
		next: () => Promise<any>,
	): Promise<any> {
		if (interceptors.length === 0) {
			return await next();
		}

		let index = 0;

		const executeNext = async (): Promise<any> => {
			if (index >= interceptors.length) {
				return await next();
			}

			const InterceptorClass = interceptors[index++];
			const interceptor = this.container.get(InterceptorClass);

			return await interceptor.intercept(context, executeNext);
		};

		return await executeNext();
	}

	/**
	 * Extracts parameters for a route handler.
	 *
	 * @param route - The route
	 * @param req - The request object
	 * @param res - The response object
	 * @returns Array of parameter values
	 */
	private async extractHandlerParams(
		route: Route,
		req: any,
		res: any,
	): Promise<any[]> {
		const routeParams: RouteParamMetadata[] =
			Reflect.getMetadata(ROUTE_PARAMS, route.handler) || [];

		if (routeParams.length === 0) {
			return [];
		}

		// Sort by index to ensure correct order
		routeParams.sort((a, b) => a.index - b.index);

		const params: any[] = new Array(routeParams.length);

		// Extract URL parameters
		const urlParams = extractParams(req.url.split("?")[0], route.path);

		// Extract query parameters
		const queryParams = extractQuery(req.url);

		// Parse cookies if not already parsed
		if (!req.cookies) {
			req.cookies = this.parseCookies(req.headers.cookie);
		}

		// Parse body if not already parsed
		if (!req.body && req.method !== "GET" && req.method !== "HEAD") {
			req.body = await this.parseBody(req);
		}

		// Get pipes from controller and method level
		const controllerPipes: any[] =
			Reflect.getMetadata(PIPES_METADATA, route.controller.constructor) || [];
		const methodPipes: any[] =
			Reflect.getMetadata(PIPES_METADATA, route.handler) || [];

		for (const paramMetadata of routeParams) {
			let value = this.extractParam(
				paramMetadata,
				req,
				res,
				urlParams,
				queryParams,
			);

			// Apply pipes: parameter-level -> method-level -> controller-level
			const pipes = [
				...(paramMetadata.pipes || []),
				...methodPipes,
				...controllerPipes,
			];

			if (pipes.length > 0) {
				value = await this.executePipes(value, paramMetadata, pipes);
			}

			params[paramMetadata.index] = value;
		}

		return params;
	}

	/**
	 * Extracts a single parameter value based on its metadata.
	 */
	private extractParam(
		metadata: RouteParamMetadata,
		req: any,
		res: any,
		urlParams: Record<string, string>,
		queryParams: Record<string, string>,
	): any {
		switch (metadata.type) {
			case ParamType.BODY:
				return metadata.data ? req.body?.[metadata.data] : req.body;

			case ParamType.PARAM:
				return metadata.data ? urlParams[metadata.data] : urlParams;

			case ParamType.QUERY:
				return metadata.data ? queryParams[metadata.data] : queryParams;

			case ParamType.HEADERS:
				return metadata.data
					? req.headers[metadata.data.toLowerCase()]
					: req.headers;

			case ParamType.COOKIES:
				return metadata.data ? req.cookies?.[metadata.data] : req.cookies;

			case ParamType.REQUEST:
				return req;

			case ParamType.RESPONSE:
				return res;

			case ParamType.NEXT:
				return () => {}; // Placeholder for next function

			case ParamType.SESSION:
				return req.session;

			case ParamType.IP:
				return (
					req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
					req.socket?.remoteAddress
				);

			case ParamType.HOST:
				return req.headers.host;

			default:
				return undefined;
		}
	}

	/**
	 * Executes pipes on a parameter value.
	 *
	 * @param value - The parameter value
	 * @param metadata - The parameter metadata
	 * @param pipes - Array of pipe classes or instances
	 * @returns The transformed value
	 */
	private async executePipes(
		value: any,
		metadata: RouteParamMetadata,
		pipes: any[],
	): Promise<any> {
		let result = value;

		// Build argument metadata
		const argumentMetadata: ArgumentMetadata = {
			type: this.mapParamTypeToArgumentType(metadata.type),
			data: metadata.data,
			metatype: undefined, // We could enhance this by extracting design:type
		};

		for (const pipe of pipes) {
			let pipeInstance: PipeTransform;

			// Check if pipe is a class or an instance
			if (typeof pipe === "function") {
				// Try to get from DI container, if not found, instantiate directly
				try {
					pipeInstance = this.container.get(pipe);
				} catch {
					// If not in container, create a new instance
					// This allows built-in pipes to work without registration
					pipeInstance = new pipe();
				}
			} else {
				pipeInstance = pipe;
			}

			result = await pipeInstance.transform(result, argumentMetadata);
		}

		return result;
	}

	/**
	 * Maps ParamType to ArgumentMetadata type.
	 */
	private mapParamTypeToArgumentType(
		paramType: ParamType,
	): "body" | "query" | "param" | "custom" {
		switch (paramType) {
			case ParamType.BODY:
				return "body";
			case ParamType.QUERY:
				return "query";
			case ParamType.PARAM:
				return "param";
			default:
				return "custom";
		}
	}

	/**
	 * Parses cookies from the cookie header.
	 */
	private parseCookies(cookieHeader?: string): Record<string, string> {
		if (!cookieHeader) {
			return {};
		}

		const cookies: Record<string, string> = {};
		cookieHeader.split(";").forEach((cookie) => {
			const [key, value] = cookie.trim().split("=");
			if (key) {
				cookies[key] = decodeURIComponent(value || "");
			}
		});

		return cookies;
	}

	/**
	 * Parses the request body.
	 */
	private async parseBody(req: any): Promise<any> {
		const contentType = req.headers["content-type"] || "";

		try {
			const text = await req.text();

			if (contentType.includes("application/json")) {
				return JSON.parse(text);
			} else if (contentType.includes("application/x-www-form-urlencoded")) {
				return Object.fromEntries(new URLSearchParams(text));
			}

			return text;
		} catch (error) {
			return undefined;
		}
	}
}
