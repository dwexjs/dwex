import type { Command } from "commander";
import { loadConfig } from "../config/index.js";
import { logger, resolveProjectPath, bundle } from "../utils/index.js";
import ora from "ora";
import { existsSync } from "node:fs";

/**
 * Build command - bundles the app for production
 */
export async function buildCommand(program: Command): Promise<void> {
	program
		.command("build")
		.description("Bundle application for production")
		.option("--no-minify", "Disable minification")
		.option("--sourcemap <type>", "Sourcemap type (none, inline, external)")
		.option("-o, --outdir <dir>", "Output directory")
		.action(async (options) => {
			const config = await loadConfig();

			const entryPath = resolveProjectPath(config.entry);
			const outdir = options.outdir || config.outdir;

			// Validate entry file exists
			if (!existsSync(entryPath)) {
				logger.error(`Entry file not found: ${config.entry}`);
				logger.info(
					`Make sure ${logger.cyan(config.entry)} exists or update your ${logger.cyan("dwex.config.ts")}`,
				);
				process.exit(1);
			}

			logger.info(
				`Building ${logger.cyan("Dwex")} application for production...\n`,
			);

			const spinner = ora({
				text: "Bundling...",
				color: "cyan",
			}).start();

			try {
				await bundle({
					entry: entryPath,
					outdir: resolveProjectPath(outdir),
					minify: options.minify !== false,
					sourcemap: options.sourcemap || config.sourcemap,
					external: config.external,
					target: config.target,
				});

				spinner.succeed(logger.green("Build completed successfully!"));
				logger.log(`\n  ${logger.dim("➜")}  Output: ${logger.cyan(outdir)}\n`);
			} catch (error) {
				spinner.fail(logger.red("Build failed"));
				logger.error(
					error instanceof Error ? error.message : String(error),
				);
				process.exit(1);
			}
		});
}
