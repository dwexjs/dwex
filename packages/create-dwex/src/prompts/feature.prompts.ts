import * as clack from "@clack/prompts";
import pc from "picocolors";
import type { Feature } from "../types.js";
import { BasePrompt } from "./base.js";
import { validateFeatureIds, validateAiAssistants } from "../utils/validation.js";
import { Logger } from "../utils/logger.js";

/**
 * Prompt for selecting features
 */
export class FeatureSelectionPrompt extends BasePrompt<string[]> {
	constructor(private readonly availableFeatures: Feature[]) {
		super();
	}

	async execute(cliValue?: string[]): Promise<string[]> {
		if (this.availableFeatures.length === 0) {
			return [];
		}

		// If CLI value provided, validate and use it
		if (cliValue !== undefined) {
			const availableIds = new Set(this.availableFeatures.map((f) => f.id));
			const { valid, invalidIds } = validateFeatureIds(cliValue, availableIds);

			if (!valid) {
				Logger.error(
					`Unknown features: ${invalidIds.join(", ")}\n${pc.gray(`Available features: ${Array.from(availableIds).join(", ")}`)}`,
				);
			}

			return cliValue;
		}

		// Interactive prompt
		const features = await clack.multiselect({
			message: "Select features to include (optional):",
			options: this.availableFeatures.map((f) => ({
				value: f.id,
				label: f.name,
				hint: f.description,
			})),
			required: false,
		});

		return this.handleCancel(features) as string[];
	}
}

/**
 * Prompt for selecting AI assistants
 */
export class AiAssistantPrompt extends BasePrompt<string[]> {
	async execute(cliValue?: string[]): Promise<string[]> {
		// If CLI value provided, validate and use it
		if (cliValue !== undefined) {
			const { valid, invalidAssistants } = validateAiAssistants(cliValue);

			if (!valid) {
				Logger.error(
					`Invalid AI assistants: ${invalidAssistants.join(", ")}\nValid options: claude, cursor, copilot`,
				);
			}

			return cliValue;
		}

		// Interactive prompt
		const aiAgents = await clack.multiselect({
			message: "Which AI assistants do you use? (optional)",
			options: [
				{
					value: "claude",
					label: "Claude",
					hint: "Generates CLAUDE.md and .mcp.json for MCP server connection",
				},
				{
					value: "cursor",
					label: "Cursor",
					hint: "Generates .cursorrules and .cursor/mcp.json for MCP integration",
				},
				{
					value: "copilot",
					label: "GitHub Copilot",
					hint: "Generates .github/copilot-instructions.md",
				},
			],
			required: false,
		});

		return (this.handleCancel(aiAgents) as string[]) || [];
	}
}
