import * as clack from "@clack/prompts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import pc from "picocolors";
import type { ProjectConfig, Template } from "./types.js";

/**
 * Prompts the user for project name
 */
export async function promptProjectName(): Promise<string> {
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
export async function promptPort(): Promise<number> {
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
 * Prompts the user to select a template
 */
export async function promptTemplate(templates: Template[]): Promise<string> {
	const template = await clack.select({
		message: "Pick a template",
		options: templates.map((t) => ({
			value: t.name,
			label: t.name,
			hint: t.description,
		})),
	});

	if (clack.isCancel(template)) {
		clack.cancel("Operation cancelled");
		process.exit(0);
	}

	return template as string;
}

/**
 * Prompts the user whether to initialize git
 */
export async function promptInitGit(): Promise<boolean> {
	const initGit = await clack.confirm({
		message: "Initialize git repository?",
		initialValue: true,
	});

	if (clack.isCancel(initGit)) {
		clack.cancel("Operation cancelled");
		process.exit(0);
	}

	return initGit as boolean;
}

/**
 * Collects all project configuration from user prompts
 */
export async function collectProjectConfig(
	templates: Template[],
	version: string,
): Promise<{ config: ProjectConfig; projectPath: string }> {
	const projectName = await promptProjectName();
	const projectPath = validateProjectPath(projectName);
	const port = await promptPort();
	const template = await promptTemplate(templates);
	const initGit = await promptInitGit();

	return {
		config: {
			projectName,
			port,
			template,
			version,
			initGit,
		},
		projectPath,
	};
}
