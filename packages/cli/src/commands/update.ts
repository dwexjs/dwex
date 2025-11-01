import type { Command } from "commander";
import { logger } from "../utils/index.js";
import ora from "ora";
import { $ } from "bun";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * List of all official Dwex packages that can be updated
 */
const DWEX_PACKAGES = [
	"@dwex/core",
	"@dwex/common",
	"@dwex/cli",
	"@dwex/jwt",
	"@dwex/logger",
	"@dwex/ai",
	"@dwex/openapi",
] as const;

/**
 * Interface for package information from npm registry
 */
interface PackageInfo {
	name: string;
	version: string;
	"dist-tags": {
		latest: string;
		beta?: string;
	};
}

/**
 * Fetches the latest version of a package from npm registry
 */
async function fetchLatestVersion(packageName: string): Promise<string | null> {
	try {
		const response = await fetch(`https://registry.npmjs.org/${packageName}`);
		if (!response.ok) {
			return null;
		}
		const data = (await response.json()) as PackageInfo;
		return data["dist-tags"].latest;
	} catch {
		return null;
	}
}

/**
 * Gets the currently installed version of a package
 */
async function getInstalledVersion(
	packageName: string,
	projectRoot: string,
): Promise<string | null> {
	const packageJsonPath = join(projectRoot, "package.json");

	if (!existsSync(packageJsonPath)) {
		return null;
	}

	try {
		const packageJsonFile = Bun.file(packageJsonPath);
		const packageJson = await packageJsonFile.json();

		const version =
			packageJson.dependencies?.[packageName] ||
			packageJson.devDependencies?.[packageName];

		if (!version) {
			return null;
		}

		// Remove version prefixes like ^, ~, >=
		return version.replace(/^[\^~>=<]+/, "");
	} catch {
		return null;
	}
}

/**
 * Update command - updates all Dwex packages to their latest versions
 */
export async function updateCommand(program: Command): Promise<void> {
	program
		.command("update")
		.description("Update all Dwex packages to their latest versions")
		.option("--beta", "Update to latest beta versions instead of stable")
		.option("--dry-run", "Show what would be updated without making changes")
		.action(async (options) => {
			const projectRoot = process.cwd();
			const packageJsonPath = join(projectRoot, "package.json");

			// Validate package.json exists
			if (!existsSync(packageJsonPath)) {
				logger.error("No package.json found in current directory");
				logger.info(`Make sure you're in a Node.js/Bun project directory`);
				process.exit(1);
			}

			logger.info(
				`${options.dryRun ? "Checking" : "Updating"} ${logger.cyan("Dwex")} packages...\n`,
			);

			const spinner = ora({
				text: "Fetching package information...",
				color: "cyan",
			}).start();

			try {
				// Find installed Dwex packages and their versions
				const installedPackages: Array<{
					name: string;
					current: string;
					latest: string;
				}> = [];

				for (const packageName of DWEX_PACKAGES) {
					const currentVersion = await getInstalledVersion(
						packageName,
						projectRoot,
					);

					if (!currentVersion) {
						continue; // Package not installed, skip
					}

					spinner.text = `Checking ${packageName}...`;
					const latestVersion = await fetchLatestVersion(packageName);

					if (!latestVersion) {
						logger.warn(`Could not fetch latest version for ${packageName}`);
						continue;
					}

					if (currentVersion !== latestVersion) {
						installedPackages.push({
							name: packageName,
							current: currentVersion,
							latest: latestVersion,
						});
					}
				}

				spinner.stop();

				if (installedPackages.length === 0) {
					logger.success("All Dwex packages are already up to date!");
					return;
				}

				// Display packages to be updated
				logger.log("\nPackages to update:\n");
				for (const pkg of installedPackages) {
					logger.log(
						`  ${logger.cyan(pkg.name)}: ${logger.dim(pkg.current)} → ${logger.green(pkg.latest)}`,
					);
				}
				logger.log("");

				if (options.dryRun) {
					logger.info(
						"Dry run complete. Run without --dry-run to apply updates.",
					);
					return;
				}

				// Update packages using bun
				const updateSpinner = ora({
					text: "Updating packages...",
					color: "cyan",
				}).start();

				const packagesToUpdate = installedPackages.map(
					(pkg) => `${pkg.name}@${options.beta ? "beta" : "latest"}`,
				);

				// Use Bun's shell API to run the update
				await $`bun add ${packagesToUpdate}`.quiet();

				updateSpinner.succeed(
					logger.green("All packages updated successfully!"),
				);

				logger.log(
					`\n  ${logger.dim("➜")}  Updated ${logger.cyan(installedPackages.length.toString())} package${installedPackages.length > 1 ? "s" : ""}\n`,
				);
			} catch (error) {
				spinner.fail(logger.red("Update failed"));
				logger.error(error instanceof Error ? error.message : String(error));
				process.exit(1);
			}
		});
}
