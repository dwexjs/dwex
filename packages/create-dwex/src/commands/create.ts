import pc from "picocolors";
import { BaseCommand } from "./base.js";
import type { CliOptions, Feature, ProjectConfig } from "../types.js";
import { FeatureService } from "../services/feature.service.js";
import { GitService } from "../services/git.service.js";
import { PackageService } from "../services/package.service.js";
import { TemplateService } from "../services/template.service.js";
import { BaseTemplateProcessor } from "../processors/base.processor.js";
import { FeatureProcessor } from "../processors/feature.processor.js";
import { AiConfigProcessor } from "../processors/ai-config.processor.js";
import {
	ProjectNamePrompt,
	ProjectPathValidator,
	PortPrompt,
	GitInitPrompt,
} from "../prompts/project.prompts.js";
import { FeatureSelectionPrompt } from "../prompts/feature.prompts.js";
import { Logger } from "../utils/logger.js";
import { createDirectory } from "../utils/fs.js";

/**
 * Command for creating a new Dwex project
 */
export class CreateCommand extends BaseCommand {
	// Services
	private readonly featureService: FeatureService;
	private readonly gitService: GitService;
	private readonly packageService: PackageService;
	private readonly templateService: TemplateService;

	// Processors
	private readonly baseProcessor: BaseTemplateProcessor;
	private readonly featureProcessor: FeatureProcessor;
	private readonly aiConfigProcessor: AiConfigProcessor;

	constructor(
		private readonly version: string,
		private readonly cliOptions: CliOptions,
	) {
		super();

		// Initialize services
		this.featureService = new FeatureService();
		this.gitService = new GitService();
		this.packageService = new PackageService();
		this.templateService = new TemplateService();

		// Initialize processors
		this.baseProcessor = new BaseTemplateProcessor(this.templateService);
		this.featureProcessor = new FeatureProcessor(this.templateService);
		this.aiConfigProcessor = new AiConfigProcessor();
	}

	async execute(): Promise<void> {
		// 1. Discover available features
		const availableFeatures = await this.featureService.discoverFeatures();

		// 2. Collect project configuration from user
		const { config, projectPath } = await this.collectConfiguration(
			availableFeatures,
		);

		// 3. Load selected features
		const features = await this.featureService.loadFeatures(
			config.features,
			config,
		);

		// 4. Check for feature conflicts
		const conflicts = this.featureService.checkConflicts(features);
		if (conflicts.length > 0) {
			Logger.error(`Feature conflicts detected:\n${conflicts.join("\n")}`);
		}

		// 5. Create project structure
		await this.createProject(projectPath, config, features);

		// 6. Initialize git if requested (before installing dependencies)
		if (config.initGit) {
			await this.initializeGit(projectPath);
		}

		// 7. Install dependencies
		await this.installDependencies(projectPath);

		// 8. Format project
		await this.formatProject(projectPath);

		// 9. Commit installed dependencies if git was initialized
		if (config.initGit) {
			await this.commitDependencies(projectPath);
		}
	}

	/**
	 * Collects project configuration from prompts
	 */
	private async collectConfiguration(
		availableFeatures: Feature[],
	): Promise<{ config: ProjectConfig; projectPath: string }> {
		// Prompts
		const projectNamePrompt = new ProjectNamePrompt();
		const pathValidator = new ProjectPathValidator();
		const portPrompt = new PortPrompt();
		const featurePrompt = new FeatureSelectionPrompt(availableFeatures);
		const gitPrompt = new GitInitPrompt();

		// Collect values
		const projectName = await projectNamePrompt.execute(
			this.cliOptions.projectName,
		);
		const projectPath = pathValidator.validate(projectName);
		const port = await portPrompt.execute(this.cliOptions.port);
		const features = await featurePrompt.execute(this.cliOptions.features);

		// Determine git initialization
		let initGit: boolean;
		if (this.cliOptions.git !== undefined) {
			initGit = this.cliOptions.git;
		} else if (this.cliOptions.noGit !== undefined) {
			initGit = !this.cliOptions.noGit;
		} else {
			initGit = await gitPrompt.execute();
		}

		return {
			config: {
				projectName,
				port,
				features,
				version: this.version,
				initGit,
			},
			projectPath,
		};
	}

	/**
	 * Creates the project structure using processors
	 */
	private async createProject(
		projectPath: string,
		config: ProjectConfig,
		features: Feature[],
	): Promise<void> {
		const spinner = Logger.spinner();
		spinner.start("Creating project...");

		try {
			// Create project directory
			await createDirectory(projectPath);

			// Process using chain of processors
			const context = { projectPath, config, features };

			await this.baseProcessor.process(context);
			await this.featureProcessor.process(context);
			await this.packageService.mergeDependencies(projectPath, features);
			await this.aiConfigProcessor.process(context);

			spinner.stop(pc.green("Project created successfully!"));

			// Show selected features
			if (config.features.length > 0) {
				const featureNames = features.map((f) => f.name).join(", ");
				Logger.note(`Selected features: ${featureNames}`, "Features");
			}
		} catch (error) {
			spinner.stop(pc.red("Failed to create project"));
			Logger.error("Project creation failed", error);
		}
	}

	/**
	 * Installs project dependencies
	 */
	private async installDependencies(projectPath: string): Promise<void> {
		const spinner = Logger.spinner();
		spinner.start("Installing dependencies...");

		try {
			const success = await this.packageService.installDependencies(projectPath);
			if (success) {
				spinner.stop(pc.green("Dependencies installed"));
			} else {
				spinner.stop(pc.yellow("Failed to install dependencies"));
			}
		} catch (error) {
			spinner.stop(pc.yellow("Failed to install dependencies"));
			console.error(error);
		}
	}

	/**
	 * Formats the project using Biome
	 */
	private async formatProject(projectPath: string): Promise<void> {
		try {
			await this.packageService.formatProject(projectPath);
		} catch (error) {
			// Silently fail - formatting is not critical
			console.error(error);
		}
	}

	/**
	 * Initializes git repository
	 */
	private async initializeGit(projectPath: string): Promise<void> {
		try {
			await this.gitService.initializeRepository(projectPath);
		} catch (error) {
			Logger.warning("Failed to initialize git repository");
			console.error(error);
		}
	}

	/**
	 * Commits installed dependencies
	 */
	private async commitDependencies(projectPath: string): Promise<void> {
		try {
			await this.gitService.addAll(projectPath);
			await this.gitService.commit(projectPath, "chore: install dependencies");
		} catch (error) {
			// Silently fail - not critical if this fails
			console.error(error);
		}
	}
}
