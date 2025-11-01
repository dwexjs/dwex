import type { IProcessor, ProcessorContext } from "../types.js";
import { TemplateService } from "../services/template.service.js";

/**
 * Processor for copying and processing the base template
 *
 * This processor ensures ALL base template files are copied to the project,
 * including:
 * - Hidden files (.gitignore, .cursorrules, etc.)
 * - Configuration files (tsconfig.json, biome.json, etc.)
 * - Source code structure
 * - Documentation files
 *
 * Base files are processed FIRST, before any feature files, to guarantee
 * a complete project structure regardless of selected features.
 */
export class BaseTemplateProcessor implements IProcessor {
	constructor(private readonly templateService: TemplateService) {}

	async process(context: ProcessorContext): Promise<void> {
		// Process ALL files from the base template directory
		// This includes hidden files, dot files, and all subdirectories
		await this.templateService.processBaseTemplate(
			context.projectPath,
			context.config,
		);
	}
}
