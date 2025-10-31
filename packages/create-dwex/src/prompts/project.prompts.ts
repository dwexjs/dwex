import * as clack from "@clack/prompts";
import { BasePrompt } from "./base.js";
import { validateProjectName, validatePort } from "../utils/validation.js";
import { directoryExists, resolvePath } from "../utils/fs.js";
import { Logger } from "../utils/logger.js";

/**
 * Prompt for project name
 */
export class ProjectNamePrompt extends BasePrompt<string> {
	async execute(cliValue?: string): Promise<string> {
		// If CLI value provided, validate and use it
		if (cliValue !== undefined) {
			const error = validateProjectName(cliValue);
			if (error) {
				Logger.error(error);
			}
			return cliValue;
		}

		// Interactive prompt
		const projectName = await clack.text({
			message: "What is your project name?",
			placeholder: "my-dwex-app",
			validate: validateProjectName,
		});

		return this.handleCancel(projectName) as string;
	}
}

/**
 * Validates that the project directory doesn't already exist
 */
export class ProjectPathValidator {
	validate(projectName: string): string {
		const projectPath = resolvePath(projectName);

		if (directoryExists(projectPath)) {
			Logger.error(`Directory ${projectName} already exists`);
		}

		return projectPath;
	}
}

/**
 * Prompt for server port
 */
export class PortPrompt extends BasePrompt<number> {
	async execute(cliValue?: number): Promise<number> {
		// If CLI value provided, use it
		if (cliValue !== undefined) {
			return cliValue;
		}

		// Interactive prompt
		const port = await clack.text({
			message: "What port should the server run on?",
			placeholder: "9929",
			initialValue: "9929",
			validate: validatePort,
		});

		return Number.parseInt(this.handleCancel(port) as string, 10);
	}
}

/**
 * Prompt for git initialization
 */
export class GitInitPrompt extends BasePrompt<boolean> {
	async execute(cliValue?: boolean): Promise<boolean> {
		// If CLI value provided, use it
		if (cliValue !== undefined) {
			return cliValue;
		}

		// Interactive prompt
		const initGit = await clack.confirm({
			message: "Initialize git repository?",
			initialValue: true,
		});

		return this.handleCancel(initGit) as boolean;
	}
}
