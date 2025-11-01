import type { IService, ProjectConfig } from "../types.js";
import { getTemplatePath, processTemplateFiles } from "../utils/fs.js";

/**
 * Service for handling template operations
 *
 * Template processing follows a strict order:
 * 1. Base template - ALL base files are copied (including .gitignore, hidden files, etc.)
 * 2. Feature files - Features can add new files or override base files
 *
 * This ensures every generated project has a complete base structure,
 * regardless of which features are selected.
 */
export class TemplateService implements IService {
	/**
	 * Gets the path to the base template directory
	 */
	getBaseTemplatePath(): string {
		return getTemplatePath("base");
	}

	/**
	 * Gets the path to a feature directory
	 */
	getFeaturePath(featureId: string): string {
		return getTemplatePath("features", featureId);
	}

	/**
	 * Processes and copies the base template to the project directory
	 *
	 * This method copies ALL files from templates/base/ including:
	 * - Hidden files (.gitignore, .cursorrules, .github/, .vscode/, etc.)
	 * - Configuration files (package.json, tsconfig.json, biome.json, etc.)
	 * - Source code (src/ directory and all contents)
	 * - Documentation (README.md, CLAUDE.md, etc.)
	 *
	 * All files are processed with EJS templating to inject project configuration.
	 */
	async processBaseTemplate(
		projectPath: string,
		config: ProjectConfig,
	): Promise<void> {
		const baseTemplatePath = this.getBaseTemplatePath();
		await processTemplateFiles(baseTemplatePath, projectPath, config);
	}

	/**
	 * Processes and copies feature files to the project directory
	 *
	 * Feature files are copied from templates/features/{featureId}/files/
	 * They can:
	 * - Add new files to the project
	 * - Override base template files (e.g., a feature might replace app.controller.ts)
	 * - Add new directories and subdirectories
	 *
	 * If a feature has no files/ directory, this method silently skips it.
	 */
	async processFeatureFiles(
		featureId: string,
		projectPath: string,
		config: ProjectConfig,
	): Promise<void> {
		const featureFilesPath = getTemplatePath("features", featureId, "files");

		// Copy feature files if they exist
		try {
			await processTemplateFiles(featureFilesPath, projectPath, config);
		} catch {
			// No files to copy or error reading directory - skip
			return;
		}
	}
}
