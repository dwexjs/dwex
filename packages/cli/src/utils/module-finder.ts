import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { getModulesDir, hasModulesDir } from "./paths.js";

export interface ModuleInfo {
	name: string;
	path: string;
}

/**
 * Find all modules in the modules directory
 */
export function findModules(): ModuleInfo[] {
	if (!hasModulesDir()) {
		return [];
	}

	const modulesDir = getModulesDir();
	const entries = readdirSync(modulesDir);

	const modules: ModuleInfo[] = [];

	for (const entry of entries) {
		const entryPath = join(modulesDir, entry);
		const stat = statSync(entryPath);

		if (stat.isDirectory()) {
			// Check if it has a module file
			const hasModuleFile =
				readdirSync(entryPath).some(
					(file) =>
						file.endsWith(".module.ts") || file.endsWith(".module.js"),
				) || true; // Allow folders even without module file for now

			if (hasModuleFile) {
				modules.push({
					name: entry,
					path: entryPath,
				});
			}
		}
	}

	return modules;
}

/**
 * Check if a module exists
 */
export function moduleExists(name: string): boolean {
	const modules = findModules();
	return modules.some((m) => m.name === name);
}

/**
 * Get module path
 */
export function getModulePath(name: string): string | null {
	const modules = findModules();
	const module = modules.find((m) => m.name === name);
	return module ? module.path : null;
}
