import type { ExecutionContext } from './execution-context.interface.js';

/**
 * Interface for implementing guards that determine whether
 * a request should be handled by the route handler.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class AuthGuard implements CanActivate {
 *   canActivate(context: ExecutionContext): boolean {
 *     const request = context.getRequest();
 *     return !!request.headers.authorization;
 *   }
 * }
 * ```
 */
export interface CanActivate {
  /**
   * Determines whether the current request is allowed to proceed.
   *
   * @param context - The execution context
   * @returns true if the request is allowed, false otherwise.
   *          Can also return a Promise<boolean> for async validation.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Promise<void> | void;
}
