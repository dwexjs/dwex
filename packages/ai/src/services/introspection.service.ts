import "reflect-metadata";
import { Injectable, Inject, Reflector } from "@dwex/core";
import type { Container, Router } from "@dwex/core";
import {
	MODULE_METADATA,
	ROUTE_PARAMS,
	HTTP_METHOD,
	ROUTE_PATH,
	CONTROLLER_PATH,
	GUARDS_METADATA,
	INTERCEPTORS_METADATA,
	MIDDLEWARE_METADATA,
	SCOPE,
	Scope,
	GLOBAL_MODULE,
	RequestMethod,
} from "@dwex/common";
import type {
	McpRouteInfo,
	McpServiceInfo,
	McpMiddlewareInfo,
	McpDependencyNode,
	McpHealthStatus,
} from "../types/mcp-types.js";
import { DWEX_CONTAINER, DWEX_ROUTER } from "../constants/tokens.js";

/**
 * Service for introspecting Dwex application internals
 * Provides methods to discover routes, services, middlewares, and dependencies
 */
@Injectable()
export class IntrospectionService {
	private readonly reflector = new Reflector();
	private readonly startTime = Date.now();

	constructor(
		@Inject(DWEX_CONTAINER) private readonly container: Container,
		@Inject(DWEX_ROUTER) private readonly router: Router,
	) {}

	/**
	 * Get all registered routes
	 */
	getRoutes(): McpRouteInfo[] {
		const routes = this.router.getRoutes();

		return routes.map((route) => ({
			path: route.path,
			method: route.method,
			controller: route.controller?.constructor?.name || "Anonymous",
			handler: route.handler?.name || "anonymous",
			guards: route.guards?.map((g: any) => g?.name || g?.constructor?.name || "Anonymous") || [],
			interceptors: route.interceptors?.map((i: any) => i?.name || i?.constructor?.name || "Anonymous") || [],
			params: this.getRouteParams(route.handler),
			metadata: this.getRouteMetadata(route.handler),
		}));
	}

	/**
	 * Get detailed information about a specific route
	 */
	getRouteDetails(method: RequestMethod, path: string): McpRouteInfo | null {
		const routes = this.getRoutes();
		return routes.find((r) => r.method === method && r.path === path) || null;
	}

	/**
	 * Get all services registered in the DI container
	 */
	getServices(): McpServiceInfo[] {
		const services: McpServiceInfo[] = [];
		const providers = (this.container as any).providers as Map<any, any>;

		for (const [token, wrapper] of providers.entries()) {
			const tokenStr = this.tokenToString(token);
			const name = wrapper.metatype?.name || tokenStr;
			const scope = wrapper.scope || Scope.SINGLETON;
			const isGlobal = wrapper.metatype ? this.reflector.get(GLOBAL_MODULE, wrapper.metatype) || false : false;

			// Get dependencies
			const dependencies = this.getServiceDependencies(wrapper.metatype);

			services.push({
				token: tokenStr,
				name,
				scope: this.scopeToString(scope),
				isGlobal,
				dependencies,
				metadata: wrapper.metatype ? this.getClassMetadata(wrapper.metatype) : undefined,
			});
		}

		return services;
	}

	/**
	 * Get detailed information about a specific service
	 */
	getServiceDetails(token: string): McpServiceInfo | null {
		const services = this.getServices();
		return services.find((s) => s.token === token || s.name === token) || null;
	}

	/**
	 * Get all middlewares (global and controller-scoped)
	 */
	getMiddlewares(): McpMiddlewareInfo[] {
		const middlewares: McpMiddlewareInfo[] = [];

		// Get global middlewares from app (this would need to be passed or stored)
		// For now, we'll focus on controller-scoped middlewares from routes

		const routes = this.router.getRoutes();
		const controllerMiddlewares = new Map<string, any>();

		for (const route of routes) {
			if (route.controller) {
				const controllerName = route.controller.constructor?.name || "Anonymous";
				if (!controllerMiddlewares.has(controllerName)) {
					const middlewareMetadata = this.reflector.get(
						MIDDLEWARE_METADATA,
						route.controller.constructor,
					);
					if (middlewareMetadata) {
						controllerMiddlewares.set(controllerName, middlewareMetadata);
					}
				}
			}
		}

		for (const [controllerName, middleware] of controllerMiddlewares.entries()) {
			middlewares.push({
				name: middleware?.name || middleware?.constructor?.name || "Anonymous",
				type: "controller",
				controller: controllerName,
				metadata: this.getClassMetadata(middleware),
			});
		}

		return middlewares;
	}

	/**
	 * Build a dependency graph of all services
	 */
	getDependencyGraph(): McpDependencyNode[] {
		const services = this.getServices();
		const nodes: McpDependencyNode[] = [];

		// Build dependency map
		const dependents = new Map<string, string[]>();

		for (const service of services) {
			// Initialize dependents tracking
			if (!dependents.has(service.token)) {
				dependents.set(service.token, []);
			}

			// Track who depends on this service
			for (const dep of service.dependencies) {
				if (!dependents.has(dep)) {
					dependents.set(dep, []);
				}
				dependents.get(dep)!.push(service.token);
			}
		}

		// Build nodes
		for (const service of services) {
			nodes.push({
				token: service.token,
				name: service.name,
				scope: service.scope,
				dependencies: service.dependencies,
				dependents: dependents.get(service.token) || [],
			});
		}

		return nodes;
	}

	/**
	 * Get application health status
	 */
	getHealth(): McpHealthStatus {
		const routes = this.getRoutes();
		const services = this.getServices();
		const middlewares = this.getMiddlewares();

		return {
			status: "healthy",
			uptime: Date.now() - this.startTime,
			timestamp: new Date().toISOString(),
			routes: routes.length,
			services: services.length,
			middlewares: middlewares.length,
		};
	}

	/**
	 * Get route parameters metadata
	 */
	private getRouteParams(handler: Function): any[] {
		const params = this.reflector.get(ROUTE_PARAMS, handler) || [];
		return params.map((param: any) => ({
			type: param.type,
			index: param.index,
			data: param.data,
		}));
	}

	/**
	 * Get route metadata
	 */
	private getRouteMetadata(handler: Function): Record<string, unknown> {
		const metadata: Record<string, unknown> = {};

		// Try to get common metadata
		const httpMethod = this.reflector.get(HTTP_METHOD, handler);
		const routePath = this.reflector.get(ROUTE_PATH, handler);
		const guards = this.reflector.get(GUARDS_METADATA, handler);
		const interceptors = this.reflector.get(INTERCEPTORS_METADATA, handler);

		if (httpMethod !== undefined) metadata.httpMethod = httpMethod;
		if (routePath !== undefined) metadata.routePath = routePath;
		if (guards !== undefined) metadata.guards = guards;
		if (interceptors !== undefined) metadata.interceptors = interceptors;

		return metadata;
	}

	/**
	 * Get class metadata
	 */
	private getClassMetadata(target: any): Record<string, unknown> | undefined {
		if (!target) return undefined;

		const metadata: Record<string, unknown> = {};

		// Try to get common metadata
		const scope = this.reflector.get(SCOPE, target);
		const controllerPath = this.reflector.get(CONTROLLER_PATH, target);
		const moduleMetadata = this.reflector.get(MODULE_METADATA, target);
		const isGlobal = this.reflector.get(GLOBAL_MODULE, target);

		if (scope !== undefined) metadata.scope = scope;
		if (controllerPath !== undefined) metadata.controllerPath = controllerPath;
		if (moduleMetadata !== undefined) metadata.module = moduleMetadata;
		if (isGlobal !== undefined) metadata.isGlobal = isGlobal;

		return Object.keys(metadata).length > 0 ? metadata : undefined;
	}

	/**
	 * Get service dependencies
	 */
	private getServiceDependencies(metatype: any): string[] {
		if (!metatype) return [];

		const paramTypes = Reflect.getMetadata("design:paramtypes", metatype) || [];
		return paramTypes.map((type: any) => this.tokenToString(type));
	}

	/**
	 * Convert injection token to string
	 */
	private tokenToString(token: any): string {
		if (typeof token === "string") return token;
		if (typeof token === "symbol") return token.toString();
		if (typeof token === "function") return token.name || "Anonymous";
		return String(token);
	}

	/**
	 * Convert scope to string
	 */
	private scopeToString(scope: Scope): "SINGLETON" | "REQUEST" | "TRANSIENT" {
		switch (scope) {
			case Scope.SINGLETON:
				return "SINGLETON";
			case Scope.REQUEST:
				return "REQUEST";
			case Scope.TRANSIENT:
				return "TRANSIENT";
			default:
				return "SINGLETON";
		}
	}
}
