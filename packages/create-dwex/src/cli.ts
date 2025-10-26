import * as clack from "@clack/prompts";
import { mkdir } from "node:fs/promises";
import pc from "picocolors";
import {
	discoverFeatures,
	composeProject,
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

	// Discover available features
	const features = await discoverFeatures();

	// Get create-dwex version
	const version = await getCreateDwexVersion();

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

		// Format code with Biome
		const formatSpinner = clack.spinner();
		formatSpinner.start("Formatting code with Biome...");

		try {
			const formatProc = Bun.spawn(["bunx", "biome", "format", "--write", "."], {
				cwd: projectPath,
				stdout: "inherit",
				stderr: "inherit",
			});
			await formatProc.exited;
			if (formatProc.exitCode === 0) {
				formatSpinner.stop(pc.green("Code formatted"));
			} else {
				formatSpinner.stop(pc.yellow("Failed to format code"));
			}
		} catch (error) {
			formatSpinner.stop(pc.yellow("Failed to format code"));
			console.error(error);
		}

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
		const nextSteps = [
			`${pc.cyan("cd")} ${config.projectName}`,
			`${pc.cyan("bun run dev")}`,
		];

		// Add feature-specific notes
		if (config.features.includes("openapi")) {
			nextSteps.push(
				"",
				`📚 API docs available at: ${pc.cyan(`http://localhost:${config.port}/docs`)}`,
			);
		}

		if (config.features.includes("auth-jwt")) {
			nextSteps.push(
				"",
				`🔐 Auth endpoints: ${pc.cyan(`http://localhost:${config.port}/auth/login`)}`,
			);
		}

		clack.note(nextSteps.join("\n"), "Next steps");

		clack.outro(pc.green("Happy coding! 🚀"));
	} catch (error) {
		spinner.stop(pc.red("Failed to create project"));
		console.error(error);
		process.exit(1);
	}
}
