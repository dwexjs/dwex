import type { IProcessor, ProcessorContext } from "../types.js";
import { TemplateService } from "../services/template.service.js";

/**
 * Processor for copying and processing the base template
 */
export class BaseTemplateProcessor implements IProcessor {
	constructor(private readonly templateService: TemplateService) {}

	async process(context: ProcessorContext): Promise<void> {
		await this.templateService.processBaseTemplate(
			context.projectPath,
			context.config,
		);
	}
}
