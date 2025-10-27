import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { render } from "ejs";
import { logger } from "../utils/index.js";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface GeneratorOptions {
	name: string;
	path: string;
}

export interface TemplateData {
	className: string;
	fileName: string;
	serviceName: string;
	routePath: string;
	[key: string]: string;
}

/**
 * Base class for all generators
 */
export abstract class BaseGenerator {
	protected abstract templateDir: string;

	/**
	 * Generate files from templates
	 */
	protected async generateFile(
		templateName: string,
		outputPath: string,
		data: TemplateData,
	): Promise<void> {
		try {
			// Resolve template path relative to the CLI package
			const templatePath = join(
				__dirname,
				"../../templates",
				this.templateDir,
				templateName,
			);

			if (!existsSync(templatePath)) {
				logger.error(`Template not found: ${templatePath}`);
				return;
			}

			const template = readFileSync(templatePath, "utf-8");
			const content = render(template, data);

			// Ensure directory exists
			const outputDir = dirname(outputPath);
			if (!existsSync(outputDir)) {
				mkdirSync(outputDir, { recursive: true });
			}

			// Write file
			writeFileSync(outputPath, content, "utf-8");
			logger.success(`Created ${logger.cyan(outputPath)}`);
		} catch (error) {
			logger.error(
				`Failed to generate file: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}

	/**
	 * Convert kebab-case or snake_case to PascalCase
	 */
	protected toPascalCase(str: string): string {
		return str
			.split(/[-_]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join("");
	}

	/**
	 * Convert PascalCase or camelCase to kebab-case
	 */
	protected toKebabCase(str: string): string {
		return str
			.replace(/([a-z])([A-Z])/g, "$1-$2")
			.toLowerCase();
	}

	/**
	 * Convert name to camelCase
	 */
	protected toCamelCase(str: string): string {
		const pascal = this.toPascalCase(str);
		return pascal.charAt(0).toLowerCase() + pascal.slice(1);
	}

	/**
	 * Abstract generate method to be implemented by subclasses
	 */
	abstract generate(options: GeneratorOptions): Promise<void>;
}
