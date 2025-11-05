/**
 * Project configuration
 */
export interface ProjectConfig {
	projectName: string;
	port: number;
	features: string[];
	database?: string | null;
	version: string;
	initGit: boolean;
}

/**
 * CLI Options parsed from command line arguments
 */
export interface CliOptions {
	projectName?: string;
	port?: number;
	features?: string[];
	database?: string;
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
	devDependencies?: Record<string, string>;
	scripts?: Record<string, string>;
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

/**
 * Base command interface
 */
export interface ICommand {
	execute(): Promise<void>;
}

/**
 * Service interface for dependency injection
 */
export interface IService {
	// Marker interface for services
}

/**
 * Template processor context
 */
export interface ProcessorContext {
	projectPath: string;
	config: ProjectConfig;
	features: Feature[];
}

/**
 * Template processor interface
 */
export interface IProcessor {
	process(context: ProcessorContext): Promise<void>;
}

/**
 * Validator function type
 */
export type Validator<T> = (value: T) => string | undefined;

/**
 * Command context with all dependencies
 */
export interface CommandContext {
	version: string;
	cliOptions: CliOptions;
}
