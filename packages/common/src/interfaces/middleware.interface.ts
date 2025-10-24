/**
 * Type for middleware functions.
 *
 * @param req - The request object
 * @param res - The response object
 * @param next - Function to call the next middleware
 */
export type MiddlewareFunction = (
	req: any,
	res: any,
	next: (error?: any) => void,
) => void | Promise<void>;

/**
 * Interface for implementing class-based middleware.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class LoggerMiddleware implements DwexMiddleware {
 *   use(req: Request, res: Response, next: () => void) {
 *     console.log(`${req.method} ${req.url}`);
 *     next();
 *   }
 * }
 * ```
 */
export interface DwexMiddleware {
	/**
	 * Method called when the middleware is executed.
	 *
	 * @param req - The request object
	 * @param res - The response object
	 * @param next - Function to call the next middleware
	 */
	use(req: any, res: any, next: (error?: any) => void): void | Promise<void>;
}
