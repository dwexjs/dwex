/**
 * Project configuration
 */
export interface ProjectConfig {
	projectName: string;
	port: number;
	features: string[];
	version: string;
	initGit: boolean;
	aiAgents: string[];
}

/**
 * CLI Options parsed from command line arguments
 */
export interface CliOptions {
	projectName?: string;
	port?: number;
	features?: string[];
	git?: boolean;
	noGit?: boolean;
	help?: boolean;
}

/**
 * Feature information
 */
export interface Feature {
	id: string;
	name: string;
	description: string;
	dependencies?: Record<string, string>;
	conflicts?: string[];
	imports?: string[];
	moduleConfig?: {
		imports?: string[];
		controllers?: string[];
		providers?: string[];
	};
	mainAdditions?: {
		imports?: string[];
		beforeListen?: string[];
		afterListen?: string[];
	};
	appControllerAdditions?: {
		imports?: string[];
		methods?: Array<{ code: string }>;
	};
}
