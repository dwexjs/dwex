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
			await mkdir(targetPath, { recursive: true });
			await processTemplateFiles(sourcePath, targetPath, config);
		} else {
			// Check if file has .ejs extension
			const hasEjsExtension = entry.name.endsWith(".ejs");

			// If file ends with .ejs, remove the extension from target path
			if (hasEjsExtension) {
				targetPath = targetPath.slice(0, -4); // Remove .ejs extension
			}

			// Process file with EJS
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
		return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
	} catch {
		return [];
	}
}
