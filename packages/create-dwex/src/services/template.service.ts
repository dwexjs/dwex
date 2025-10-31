import type { IService, ProjectConfig } from "../types.js";
import { getTemplatePath, processTemplateFiles } from "../utils/fs.js";

/**
 * Service for handling template operations
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
