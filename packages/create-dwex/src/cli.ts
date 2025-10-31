import { parseArgs } from "./args.js";
import { CreateCommand } from "./commands/create.js";
import { PackageService } from "./services/package.service.js";
import { Logger } from "./utils/logger.js";

/**
 * CLI orchestrator - entry point for command execution
 */
export async function run(): Promise<void> {
	try {
		// Get version
		const packageService = new PackageService();
		const version = await packageService.getVersion();

		// Parse CLI arguments
		const cliOptions = parseArgs(process.argv, version);

		// Show intro
		Logger.intro(` Dwex v${version} `);

		// Create and execute the create command
		const command = new CreateCommand(version, cliOptions);
		await command.execute();
	} catch (error) {
		// Handle any uncaught errors
		if (error instanceof Error) {
			Logger.error("An unexpected error occurred", error);
		} else {
			Logger.error("An unexpected error occurred");
		}
	}
}
