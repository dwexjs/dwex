import * as clack from "@clack/prompts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import pc from "picocolors";
import type { ProjectConfig, Feature, CliOptions } from "./types.js";

/**
 * Prompts the user for project name
 */
export async function promptProjectName(cliValue?: string): Promise<string> {
	// If CLI value provided, validate and use it
	if (cliValue !== undefined) {
		if (!cliValue) {
			clack.outro(pc.red("Project name cannot be empty"));
			process.exit(1);
		}
		if (!/^[a-z0-9-]+$/.test(cliValue)) {
			clack.outro(
				pc.red(
					"Project name must contain only lowercase letters, numbers, and hyphens",
				),
			);
			process.exit(1);
		}
		return cliValue;
	}

	// Interactive prompt
	const projectName = await clack.text({
		message: "What is your project name?",
		placeholder: "my-dwex-app",
		validate: (value) => {
			if (!value) return "Project name is required";
			if (!/^[a-z0-9-]+$/.test(value)) {
				return "Project name must contain only lowercase letters, numbers, and hyphens";
			}
			return undefined;
		},
	});

	if (clack.isCancel(projectName)) {
		clack.cancel("Operation cancelled");
		process.exit(0);
	}

	return projectName as string;
}

/**
 * Validates that the project directory doesn't already exist
 */
export function validateProjectPath(projectName: string): string {
	const projectPath = resolve(process.cwd(), projectName);

	if (existsSync(projectPath)) {
		clack.outro(pc.red(`Directory ${projectName} already exists`));
		process.exit(1);
	}

	return projectPath;
}

/**
 * Prompts the user for server port
 */
export async function promptPort(cliValue?: number): Promise<number> {
	// If CLI value provided, use it
	if (cliValue !== undefined) {
		return cliValue;
	}

	// Interactive prompt
	const port = await clack.text({
		message: "What port should the server run on?",
		placeholder: "9929",
		initialValue: "9929",
		validate: (value) => {
			const num = Number.parseInt(value);
			if (Number.isNaN(num) || num < 1 || num > 65535) {
				return "Port must be a number between 1 and 65535";
			}
			return undefined;
		},
	});

	if (clack.isCancel(port)) {
		clack.cancel("Operation cancelled");
		process.exit(0);
	}

	return Number.parseInt(port as string);
}

/**
 * Prompts the user whether to initialize git
 */
export async function promptInitGit(cliValue?: boolean): Promise<boolean> {
	// If CLI value provided, use it
	if (cliValue !== undefined) {
		return cliValue;
	}

	// Interactive prompt
	const initGit = await clack.confirm({
		message: "Initialize git repository?",
		initialValue: false,
	});

	if (clack.isCancel(initGit)) {
		clack.cancel("Operation cancelled");
		process.exit(0);
	}

	return initGit as boolean;
}

/**
 * Prompts the user to select features
 */
export async function promptFeatures(
	availableFeatures: Feature[],
	cliValue?: string[],
): Promise<string[]> {
	if (availableFeatures.length === 0) {
		return [];
	}

	// If CLI value provided, validate and use it
	if (cliValue !== undefined) {
		const availableIds = new Set(availableFeatures.map((f) => f.id));
		const invalid = cliValue.filter((id) => !availableIds.has(id));

		if (invalid.length > 0) {
			clack.outro(pc.red(`Error: Unknown features: ${invalid.join(", ")}`));
			console.log(
				pc.gray(`Available features: ${Array.from(availableIds).join(", ")}`),
			);
			process.exit(1);
		}

		return cliValue;
	}

	// Interactive prompt
	const features = await clack.multiselect({
		message: "Select features to include (optional):",
		options: availableFeatures.map((f) => ({
			value: f.id,
			label: f.name,
			hint: f.description,
		})),
		required: false,
	});

	if (clack.isCancel(features)) {
		clack.cancel("Operation cancelled");
		process.exit(0);
	}

	return features as string[];
}

/**
 * Prompts the user to select AI assistants
 */
export async function promptAiAgents(cliValue?: string[]): Promise<string[]> {
	// If CLI value provided, use it
	if (cliValue !== undefined) {
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

	if (clack.isCancel(aiAgents)) {
		clack.cancel("Operation cancelled");
		process.exit(0);
	}

	return (aiAgents as string[]) || [];
}

/**
 * Collects all project configuration from user prompts
 */
export async function collectProjectConfig(
	availableFeatures: Feature[],
	version: string,
	cliOptions: CliOptions = {},
): Promise<{ config: ProjectConfig; projectPath: string }> {
	const projectName = await promptProjectName(cliOptions.projectName);
	const projectPath = validateProjectPath(projectName);
	const port = await promptPort(cliOptions.port);
	const features = await promptFeatures(availableFeatures, cliOptions.features);
	const aiAgents = await promptAiAgents(cliOptions.aiAgents);

	// Determine git initialization from CLI options
	let initGit: boolean;
	if (cliOptions.git !== undefined) {
		initGit = cliOptions.git;
	} else if (cliOptions.noGit !== undefined) {
		initGit = !cliOptions.noGit;
	} else {
		initGit = await promptInitGit();
	}

	return {
		config: {
			projectName,
			port,
			features,
			version,
			initGit,
			aiAgents,
		},
		projectPath,
	};
}
