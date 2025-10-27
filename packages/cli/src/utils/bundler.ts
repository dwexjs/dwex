import type { BuildConfig } from "bun";
import { logger } from "./logger.js";

export interface BundleOptions {
	entry: string;
	outdir: string;
	minify?: boolean;
	sourcemap?: "none" | "inline" | "external";
	external?: string[];
	target?: "bun" | "node";
}

/**
 * Bundle application for production using Bun.build()
 */
export async function bundle(options: BundleOptions): Promise<void> {
	const {
		entry,
		outdir,
		minify = true,
		sourcemap = "external",
		external = [],
		target = "bun",
	} = options;

	const startTime = performance.now();

	try {
		const buildConfig: BuildConfig = {
			entrypoints: [entry],
			outdir,
			minify: minify
				? {
						syntax: true,
						whitespace: true,
						identifiers: false, // Keep class names for better logging
				  }
				: false,
			sourcemap,
			target,
			external,
			splitting: false,
			format: "esm",
		};

		const result = await Bun.build(buildConfig);

		if (!result.success) {
			logger.error("Build failed:");
			for (const message of result.logs) {
				console.error(message);
			}
			throw new Error("Build failed");
		}

		const duration = ((performance.now() - startTime) / 1000).toFixed(2);
		const totalSize = result.outputs.reduce((sum, output) => sum + output.size, 0);
		const sizeInKB = (totalSize / 1024).toFixed(2);

		logger.success(
			`Built in ${logger.cyan(`${duration}s`)} → ${logger.cyan(`${sizeInKB} KB`)}`,
		);

		return;
	} catch (error) {
		logger.error(`Bundle error: ${error}`);
		throw error;
	}
}
