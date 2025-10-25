/**
 * Project configuration
 */
export interface ProjectConfig {
	projectName: string;
	port: number;
	template: string;
	version: string;
	initGit: boolean;
}

/**
 * Template information
 */
export interface Template {
	name: string;
	description: string;
}
