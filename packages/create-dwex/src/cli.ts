import * as clack from "@clack/prompts";
import { mkdir } from "node:fs/promises";
import pc from "picocolors";
import {
	discoverTemplates,
	processTemplateFiles,
	getTemplatePath,
} from "./template.js";
import { collectProjectConfig } from "./prompts.js";
import { getCreateDwexVersion } from "./package.js";
import { initializeGit } from "./git.js";

/**
 * Main CLI function
 */
export async function run(): Promise<void> {
	console.clear();

	clack.intro(pc.bgCyan(pc.black(" create-dwex ")));

	// Discover available templates
	const templates = await discoverTemplates();

	if (templates.length === 0) {
		clack.outro(pc.red("No templates found. Please check the installation."));
		process.exit(1);
	}

	// Get create-dwex version
	const version = await getCreateDwexVersion();

	// Collect project configuration from user
	const { config, projectPath } = await collectProjectConfig(
		templates,
		version,
	);

	// Create project
	const spinner = clack.spinner();
	spinner.start("Creating project...");

	try {
		// Create project directory
		await mkdir(projectPath, { recursive: true });

		// Copy and process template files
		const templatePath = getTemplatePath(config.template);
		await processTemplateFiles(templatePath, projectPath, config);

		spinner.stop(pc.green("Project created successfully!"));

		// Initialize git if requested
		if (config.initGit) {
			const gitSpinner = clack.spinner();
			gitSpinner.start("Initializing git repository...");

			try {
				await initializeGit(projectPath);
				gitSpinner.stop(pc.green("Git repository initialized"));
			} catch (error) {
				gitSpinner.stop(pc.yellow("Failed to initialize git repository"));
				console.error(error);
			}
		}

		// Show next steps
		clack.note(
			`${pc.cyan("cd")} ${config.projectName}\n${pc.cyan("bun install")}\n${pc.cyan("bun run dev")}`,
			"Next steps",
		);

		clack.outro(pc.green("Happy coding! 🚀"));
	} catch (error) {
		spinner.stop(pc.red("Failed to create project"));
		console.error(error);
		process.exit(1);
	}
}
