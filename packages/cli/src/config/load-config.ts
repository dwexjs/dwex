import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { DwexConfig } from "./schema.js";
import { mergeConfig } from "./schema.js";
import { getProjectRoot } from "../utils/paths.js";

/**
 * Load dwex.config.ts from the project root
 */
export async function loadConfig(): Promise<Required<DwexConfig>> {
	const projectRoot = getProjectRoot();
	const configPath = resolve(projectRoot, "dwex.config.ts");
	const configPathJS = resolve(projectRoot, "dwex.config.js");

	let userConfig: DwexConfig = {};

	// Try loading TypeScript config first
	if (existsSync(configPath)) {
		try {
			const configUrl = pathToFileURL(configPath).href;
			const module = await import(configUrl);
			userConfig = module.default || module;
		} catch (error) {
			console.warn(`Failed to load dwex.config.ts: ${error}`);
		}
	}
	// Fall back to JavaScript config
	else if (existsSync(configPathJS)) {
		try {
			const configUrl = pathToFileURL(configPathJS).href;
			const module = await import(configUrl);
			userConfig = module.default || module;
		} catch (error) {
			console.warn(`Failed to load dwex.config.js: ${error}`);
		}
	}

	return mergeConfig(userConfig);
}

/**
 * Check if config file exists
 */
export function hasConfigFile(): boolean {
	const projectRoot = getProjectRoot();
	const configPath = resolve(projectRoot, "dwex.config.ts");
	const configPathJS = resolve(projectRoot, "dwex.config.js");

	return existsSync(configPath) || existsSync(configPathJS);
}
