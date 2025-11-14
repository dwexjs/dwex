/**
 * CORS configuration options.
 */
export interface CorsOptions {
	/**
	 * Allowed origins. Can be a string, array of strings, or function.
	 * @default '*'
	 */
	origin?: string | string[] | ((origin: string) => boolean);

	/**
	 * Allowed HTTP methods.
	 * @default ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
	 */
	methods?: string | string[];

	/**
	 * Allowed headers.
	 */
	allowedHeaders?: string | string[];

	/**
	 * Exposed headers.
	 */
	exposedHeaders?: string | string[];

	/**
	 * Whether to allow credentials.
	 * @default false
	 */
	credentials?: boolean;

	/**
	 * Max age for preflight cache (in seconds).
	 */
	maxAge?: number;

	/**
	 * Whether to pass the CORS preflight response to the next handler.
	 * @default false
	 */
	preflightContinue?: boolean;

	/**
	 * Status code for successful OPTIONS request.
	 * @default 204
	 */
	optionsSuccessStatus?: number;
}

/**
 * Creates a CORS middleware with the given options.
 *
 * @param options - CORS configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const app = await DwexFactory.create(AppModule);
 * app.use(corsMiddleware({
 *   origin: 'https://example.com',
 *   credentials: true,
 * }));
 * ```
 */
export function corsMiddleware(options: CorsOptions = {}) {
	const {
		origin = "*",
		methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
		allowedHeaders,
		exposedHeaders,
		credentials = false,
		maxAge,
		preflightContinue = false,
		optionsSuccessStatus = 204,
	} = options;

	return (req: any, res: any, next: () => void) => {
		const requestOrigin = req.headers.origin || req.headers.referer;

		// Handle origin
		if (typeof origin === "function") {
			if (requestOrigin && origin(requestOrigin)) {
				res.setHeader("Access-Control-Allow-Origin", requestOrigin);
			}
		} else if (Array.isArray(origin)) {
			if (requestOrigin && origin.includes(requestOrigin)) {
				res.setHeader("Access-Control-Allow-Origin", requestOrigin);
			}
		} else {
			res.setHeader("Access-Control-Allow-Origin", origin);
		}

		// Handle credentials
		if (credentials) {
			res.setHeader("Access-Control-Allow-Credentials", "true");
		}

		// Handle preflight
		if (req.method === "OPTIONS") {
			// Methods
			const methodsHeader = Array.isArray(methods)
				? methods.join(",")
				: methods;
			res.setHeader("Access-Control-Allow-Methods", methodsHeader);

			// Headers
			if (allowedHeaders) {
				const headersStr = Array.isArray(allowedHeaders)
					? allowedHeaders.join(",")
					: allowedHeaders;
				res.setHeader("Access-Control-Allow-Headers", headersStr);
			} else if (req.headers["access-control-request-headers"]) {
				res.setHeader(
					"Access-Control-Allow-Headers",
					req.headers["access-control-request-headers"],
				);
			}

			// Max age
			if (maxAge) {
				res.setHeader("Access-Control-Max-Age", maxAge.toString());
			}

			if (!preflightContinue) {
				res.status(optionsSuccessStatus);
				res.setHeader("Content-Length", "0");
				res.end();
				next();
				return;
			}
		}

		// Exposed headers
		if (exposedHeaders) {
			const exposedHeadersStr = Array.isArray(exposedHeaders)
				? exposedHeaders.join(",")
				: exposedHeaders;
			res.setHeader("Access-Control-Expose-Headers", exposedHeadersStr);
		}

		next();
	};
}
