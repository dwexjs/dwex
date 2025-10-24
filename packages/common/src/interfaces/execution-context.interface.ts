/**
 * Provides details about the current request being processed.
 * Used in guards, interceptors, and exception filters.
 *
 * @example
 * ```typescript
 * class AuthGuard implements CanActivate {
 *   canActivate(context: ExecutionContext): boolean {
 *     const request = context.getRequest();
 *     const response = context.getResponse();
 *     return true;
 *   }
 * }
 * ```
 */
export interface ExecutionContext {
  /**
   * Returns the Request object.
   */
  getRequest<T = any>(): T;

  /**
   * Returns the Response object.
   */
  getResponse<T = any>(): T;

  /**
   * Returns the handler (controller method) being executed.
   */
  getHandler(): Function;

  /**
   * Returns the controller class that contains the handler.
   */
  getClass(): Function;
}
