import { mkdir } from "node:fs/promises";
import * as clack from "@clack/prompts";
import pc from "picocolors";
import { initializeGit } from "./git.js";
import { getCreateDwexVersion } from "./package.js";
import { collectProjectConfig } from "./prompts.js";
import { composeProject, discoverFeatures } from "./template.js";

/**
 * Main CLI function
 */
export async function run(): Promise<void> {
	console.log();
	
	// Get create-dwex version
	const version = await getCreateDwexVersion();

	clack.intro(pc.bgCyan(pc.black(` Dwex v${version} `)));

	// Discover available features
	const features = await discoverFeatures();

	// Collect project configuration from user
	const { config, projectPath } = await collectProjectConfig(features, version);

	// Create project
	const spinner = clack.spinner();
	spinner.start("Creating project...");

	try {
		// Create project directory
		await mkdir(projectPath, { recursive: true });

		// Compose project from base + features
		await composeProject(projectPath, config);

		spinner.stop(pc.green("Project created successfully!"));

		// Show selected features
		if (config.features.length > 0) {
			const featureNames = config.features
				.map((fId) => features.find((f) => f.id === fId)?.name)
				.filter(Boolean)
				.join(", ");
			clack.note(`Selected features: ${featureNames}`, "Features");
		}

		// Install dependencies
		const installSpinner = clack.spinner();
		installSpinner.start("Installing dependencies...");

		try {
			const installProc = Bun.spawn(["bun", "install"], {
				cwd: projectPath,
				stdout: "inherit",
				stderr: "inherit",
			});
			await installProc.exited;
			if (installProc.exitCode === 0) {
				installSpinner.stop(pc.green("Dependencies installed"));
			} else {
				installSpinner.stop(pc.yellow("Failed to install dependencies"));
			}
		} catch (error) {
			installSpinner.stop(pc.yellow("Failed to install dependencies"));
			console.error(error);
		}

		try {
			const formatProc = Bun.spawn(
				["bunx", "biome", "format", "--write", "."],
				{
					cwd: projectPath,
				},
			);
			await formatProc.exited;
		} catch (error) {
			console.error(error);
		}

		// Initialize git if requested
		if (config.initGit) {
			await initializeGit(projectPath);
		}
	} catch (error) {
		spinner.stop(pc.red("Failed to create project"));
		console.error(error);
		process.exit(1);
	}
}
