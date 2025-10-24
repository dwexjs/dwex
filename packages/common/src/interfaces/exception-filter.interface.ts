/**
 * Interface for implementing exception filters that handle
 * exceptions thrown during request processing.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class HttpExceptionFilter implements ExceptionFilter {
 *   catch(exception: Error, request: any, response: any) {
 *     const status = exception instanceof HttpException
 *       ? exception.getStatus()
 *       : 500;
 *     response.status(status).json({
 *       statusCode: status,
 *       message: exception.message,
 *     });
 *   }
 * }
 * ```
 */
export interface ExceptionFilter<T = any> {
  /**
   * Handles the exception and sends an appropriate response.
   *
   * @param exception - The exception that was thrown
   * @param request - The request object
   * @param response - The response object
   */
  catch(exception: T, request: any, response: any): void | Promise<void>;
}
