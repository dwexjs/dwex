import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import ejs from "ejs";
import type { ProjectConfig, Template } from "./types.js";

/**
 * Template descriptions for known templates
 */
const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
	default: "Basic Dwex application",
	"with-auth": "Dwex with JWT authentication",
};

/**
 * Discovers available templates by reading the templates directory
 */
export async function discoverTemplates(): Promise<Template[]> {
	const templatesDir = join(import.meta.dirname, "..", "templates");

	try {
		const entries = await readdir(templatesDir, { withFileTypes: true });
		return entries
			.filter((entry) => entry.isDirectory())
			.map((entry) => ({
				name: entry.name,
				description: TEMPLATE_DESCRIPTIONS[entry.name] || entry.name,
			}));
	} catch (error) {
		return [];
	}
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
 * Gets the path to a template directory
 */
export function getTemplatePath(templateName: string): string {
	return join(import.meta.dirname, "..", "templates", templateName);
}
