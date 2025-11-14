/**
 * Options for configuring static file serving
 */
export interface ServeStaticOptions {
	/**
	 * Root directory path to serve files from
	 * @example './public' or './dist'
	 */
	rootPath: string;

	/**
	 * URL prefix for serving static files
	 * @example '/' or '/static'
	 * @default '/'
	 */
	serveRoot?: string;

	/**
	 * Enable SPA mode - serves index.html for unmatched routes
	 * Useful for React Router, Vue Router, etc.
	 * @default false
	 */
	spa?: boolean;

	/**
	 * Index file to serve for directory requests
	 * @default 'index.html'
	 */
	indexFile?: string;

	/**
	 * Dotfile handling - 'allow', 'deny', or 'ignore'
	 * @default 'ignore'
	 */
	dotfiles?: "allow" | "deny" | "ignore";

	/**
	 * Path prefixes to exclude from static file serving
	 * Useful for excluding API routes when serving SPA from root
	 * @example ['/api', '/graphql']
	 * @default []
	 */
	exclude?: string[];
}
