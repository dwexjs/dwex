/**
 * Dwex CLI configuration schema
 */
export interface DwexConfig {
	/**
	 * Entry point file for the application
	 * @default "src/main.ts"
	 */
	entry?: string;

	/**
	 * Output directory for built files
	 * @default "dist"
	 */
	outdir?: string;

	/**
	 * Enable minification in production builds
	 * @default true
	 */
	minify?: boolean;

	/**
	 * Generate sourcemaps
	 * @default "external"
	 */
	sourcemap?: "none" | "inline" | "external";

	/**
	 * External packages to exclude from bundle
	 * @default []
	 */
	external?: string[];

	/**
	 * Target runtime
	 * @default "bun"
	 */
	target?: "bun" | "node";

	/**
	 * Port for development server
	 * @default 9929
	 */
	port?: number;
}

/**
 * Default configuration values
 */
export const defaultConfig: Required<DwexConfig> = {
	entry: "src/main.ts",
	outdir: "dist",
	minify: true,
	sourcemap: "external",
	external: [],
	target: "bun",
	port: 9929,
};

/**
 * Merge user config with defaults
 */
export function mergeConfig(userConfig: DwexConfig = {}): Required<DwexConfig> {
	return {
		...defaultConfig,
		...userConfig,
	};
}
