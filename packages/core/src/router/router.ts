import 'reflect-metadata';
import {
  CONTROLLER_PATH,
  ROUTE_PATH,
  HTTP_METHOD,
  GUARDS_METADATA,
  INTERCEPTORS_METADATA,
  RequestMethod,
  type Type,
} from '@dwexjs/common';
import type { Route } from './route.js';
import { parseRoutePath } from './route.js';

/**
 * Router for managing and matching routes.
 */
export class Router {
  private routes: Route[] = [];

  /**
   * Registers routes from a controller.
   *
   * @param controller - The controller instance
   * @param controllerClass - The controller class
   */
  registerController(controller: any, controllerClass: Type<any>): void {
    const controllerPath: string =
      Reflect.getMetadata(CONTROLLER_PATH, controllerClass) || '';

    // Get all methods from the controller
    const prototype = Object.getPrototypeOf(controller);
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      (name) => name !== 'constructor' && typeof prototype[name] === 'function',
    );

    for (const methodName of methodNames) {
      const handler = prototype[methodName];
      const routePath: string | undefined = Reflect.getMetadata(
        ROUTE_PATH,
        handler,
      );
      const httpMethod: RequestMethod | undefined = Reflect.getMetadata(
        HTTP_METHOD,
        handler,
      );

      if (httpMethod === undefined || routePath === undefined) {
        continue;
      }

      // Combine controller path and method path
      const fullPath = this.normalizePath(
        `/${controllerPath}/${routePath}`,
      );

      // Get route params metadata (not currently used)
      // const routeParams = Reflect.getMetadata(ROUTE_PARAMS, handler) || [];

      // Get guards from both controller and method
      const controllerGuards =
        Reflect.getMetadata(GUARDS_METADATA, controllerClass) || [];
      const methodGuards =
        Reflect.getMetadata(GUARDS_METADATA, handler) || [];
      const guards = [...controllerGuards, ...methodGuards];

      // Get interceptors from both controller and method
      const controllerInterceptors =
        Reflect.getMetadata(INTERCEPTORS_METADATA, controllerClass) || [];
      const methodInterceptors =
        Reflect.getMetadata(INTERCEPTORS_METADATA, handler) || [];
      const interceptors = [
        ...controllerInterceptors,
        ...methodInterceptors,
      ];

      // Parse route path to extract parameter names
      const { params: paramNames } = parseRoutePath(fullPath);

      this.routes.push({
        path: fullPath,
        method: httpMethod,
        handler,
        controller,
        params: paramNames.map((name, index) => ({ name, index })),
        guards,
        interceptors,
      });
    }
  }

  /**
   * Finds a matching route for a request.
   *
   * @param method - HTTP method
   * @param path - URL path
   * @returns The matching route or undefined
   */
  findRoute(method: string, path: string): Route | undefined {
    const normalizedPath = this.normalizePath(path);

    for (const route of this.routes) {
      // Check if method matches
      if (route.method !== RequestMethod.ALL && route.method !== method) {
        continue;
      }

      // Check if path matches
      const { regex } = parseRoutePath(route.path);
      if (regex.test(normalizedPath)) {
        return route;
      }
    }

    return undefined;
  }

  /**
   * Gets all registered routes.
   *
   * @returns Array of routes
   */
  getRoutes(): Route[] {
    return this.routes;
  }

  /**
   * Normalizes a path by removing duplicate slashes and trailing slashes.
   *
   * @param path - The path to normalize
   * @returns Normalized path
   */
  private normalizePath(path: string): string {
    return path
      .replace(/\/+/g, '/') // Remove duplicate slashes
      .replace(/\/$/, '') || '/'; // Remove trailing slash (except for root)
  }
}
