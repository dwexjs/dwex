import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import ejs from "ejs";
import type { ProjectConfig } from "../types.js";

/**
 * Checks if a directory exists
 */
export function directoryExists(path: string): boolean {
	return existsSync(path);
}

/**
 * Creates a directory recursively
 */
export async function createDirectory(path: string): Promise<void> {
	await mkdir(path, { recursive: true });
}

/**
 * Resolves a path relative to the current working directory
 */
export function resolvePath(...paths: string[]): string {
	return resolve(process.cwd(), ...paths);
}

/**
 * Gets the path to a template directory
 */
export function getTemplatePath(...segments: string[]): string {
	return join(import.meta.dirname, "..", "..", "templates", ...segments);
}

/**
 * Recursively processes template files with EJS
 *
 * This function copies all files and directories from sourceDir to targetDir,
 * processing them with EJS templating. It handles:
 * - All files including hidden files (starting with .)
 * - All subdirectories recursively
 * - EJS template files (*.ejs) - strips .ejs extension and renders content
 * - Non-template files - copies as-is but still processes with EJS
 *
 * Files are written directly, overwriting any existing files at the target path.
 * This allows features to override base files when needed.
 *
 * @param sourceDir - Source directory to copy from
 * @param targetDir - Target directory to copy to
 * @param config - Project configuration for EJS rendering
 */
export async function processTemplateFiles(
	sourceDir: string,
	targetDir: string,
	config: ProjectConfig,
): Promise<void> {
	const entries = await readdir(sourceDir, { withFileTypes: true });

	for (const entry of entries) {
		const sourcePath = join(sourceDir, entry.name);
		let targetPath = join(targetDir, entry.name);

		if (entry.isDirectory()) {
			// Create directory and recursively process its contents
			await mkdir(targetPath, { recursive: true });
			await processTemplateFiles(sourcePath, targetPath, config);
		} else {
			// Check if file has .ejs extension
			const hasEjsExtension = entry.name.endsWith(".ejs");

			// If file ends with .ejs, remove the extension from target path
			if (hasEjsExtension) {
				targetPath = targetPath.slice(0, -4); // Remove .ejs extension
			}

			// Process file with EJS and write to target
			// All files are processed with EJS, even if they don't have .ejs extension
			// This allows variable interpolation in any file type
			const content = await Bun.file(sourcePath).text();
			const rendered = ejs.render(content, config);
			await Bun.write(targetPath, rendered);
		}
	}
}

/**
 * Reads a JSON file and renders it with EJS
 */
export async function readJsonWithEjs<T>(
	filePath: string,
	config: ProjectConfig,
): Promise<T> {
	const content = await Bun.file(filePath).text();
	const rendered = ejs.render(content, config);
	return JSON.parse(rendered);
}

/**
 * Lists all directories in a given path
 */
export async function listDirectories(path: string): Promise<string[]> {
	try {
		const entries = await readdir(path, { withFileTypes: true });
		return entries
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name);
	} catch {
		return [];
	}
}
