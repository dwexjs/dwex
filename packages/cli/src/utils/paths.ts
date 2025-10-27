import { resolve, join, dirname } from "node:path";
import { existsSync } from "node:fs";

/**
 * Get the project root directory (where package.json is located)
 */
export function getProjectRoot(): string {
	let currentDir = process.cwd();

	while (currentDir !== "/") {
		const packageJsonPath = join(currentDir, "package.json");
		if (existsSync(packageJsonPath)) {
			return currentDir;
		}
		currentDir = dirname(currentDir);
	}

	return process.cwd();
}

/**
 * Resolve a path relative to the project root
 */
export function resolveProjectPath(...paths: string[]): string {
	return resolve(getProjectRoot(), ...paths);
}

/**
 * Resolve a path relative to the current working directory
 */
export function resolvePath(...paths: string[]): string {
	return resolve(process.cwd(), ...paths);
}

/**
 * Get the modules directory path
 */
export function getModulesDir(): string {
	return resolveProjectPath("modules");
}

/**
 * Get the source directory path
 */
export function getSourceDir(): string {
	return resolveProjectPath("src");
}

/**
 * Check if modules directory exists
 */
export function hasModulesDir(): boolean {
	return existsSync(getModulesDir());
}
