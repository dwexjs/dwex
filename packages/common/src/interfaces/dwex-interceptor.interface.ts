import type { ExecutionContext } from './execution-context.interface.js';

/**
 * Interface for implementing interceptors that can transform
 * the request before it reaches the handler or the response before
 * it's sent to the client.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class LoggingInterceptor implements DwexInterceptor {
 *   async intercept(context: ExecutionContext, next: () => Promise<any>) {
 *     console.log('Before...');
 *     const result = await next();
 *     console.log('After...');
 *     return result;
 *   }
 * }
 * ```
 */
export interface DwexInterceptor {
  /**
   * Intercepts the request/response cycle.
   *
   * @param context - The execution context
   * @param next - Function to call the next interceptor or handler
   * @returns The result from the handler, potentially transformed
   */
  intercept(
    context: ExecutionContext,
    next: () => Promise<any>,
  ): Promise<any>;
}
