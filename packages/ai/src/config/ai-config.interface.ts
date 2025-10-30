/**
 * Configuration options for the AI Module (MCP Server)
 */
export interface AiModuleConfig {
	/**
	 * Enable authentication for MCP endpoint
	 * @default false
	 * @remarks Set to true in production environments
	 */
	enableAuth?: boolean;

	/**
	 * API key for simple authentication
	 * @remarks Only used if enableAuth is true
	 */
	apiKey?: string;

	/**
	 * Path for the MCP endpoint
	 * @default '/mcp'
	 */
	path?: string;

	/**
	 * Maximum number of log entries to keep in buffer
	 * @default 1000
	 */
	logBufferSize?: number;

	/**
	 * Enable MCP server
	 * @default true
	 */
	enabled?: boolean;
}

/**
 * Token for injecting AI module configuration
 */
export const AI_MODULE_CONFIG = Symbol("AI_MODULE_CONFIG");
