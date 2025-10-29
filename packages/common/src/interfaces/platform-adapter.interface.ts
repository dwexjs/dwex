import type { HttpsOptions } from "@dwex/common";

/**
 * Options for starting a server on platforms that support it (e.g., Bun).
 */
export interface ListenOptions {
	/**
	 * Port to listen on
	 */
	port: number;

	/**
	 * Hostname to bind to (default: "0.0.0.0")
	 */
	hostname?: string;

	/**
	 * Optional TLS/HTTPS configuration (Bun only)
	 */
	httpsOptions?: HttpsOptions;
}

/**
 * Platform adapter interface for abstracting runtime-specific code.
 *
 * Adapters allow Dwex applications to run on different platforms (Bun, Vercel Edge, Cloudflare Workers, etc.)
 * while keeping the core application logic platform-agnostic.
 */
export interface PlatformAdapter {
	/**
	 * Platform name for identification.
	 */
	readonly name: string;

	/**
	 * Whether this platform supports starting a long-running server (e.g., Bun, Node.js).
	 * Edge function platforms (Vercel, Cloudflare, Netlify) don't support this.
	 */
	readonly supportsListen: boolean;

	/**
	 * Whether this platform requires a handler export (e.g., Vercel Edge, Cloudflare Workers).
	 */
	readonly requiresHandler: boolean;

	/**
	 * Starts the HTTP server (only supported on platforms where supportsListen is true).
	 *
	 * @param handleRequest - The core request handler function
	 * @param options - Server options (port, hostname, TLS)
	 * @throws Error if platform doesn't support listen
	 */
	listen?(
		handleRequest: (request: Request) => Promise<Response>,
		options: ListenOptions,
	): Promise<void>;

	/**
	 * Creates a handler function for serverless/edge platforms.
	 *
	 * @param handleRequest - The core request handler function
	 * @returns Handler function in platform-specific format
	 */
	createHandler?(
		handleRequest: (request: Request) => Promise<Response>,
	): (...args: any[]) => Promise<Response>;

	/**
	 * Optional platform-specific initialization logic.
	 */
	init?(): Promise<void>;

	/**
	 * Optional platform-specific cleanup logic.
	 */
	destroy?(): Promise<void>;
}
