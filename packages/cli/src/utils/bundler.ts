import type { BuildConfig } from "bun";
import { logger } from "./logger.js";
import {
	generateCloudflareWorkersConfig,
	generateNetlifyEdgeConfig,
	generateVercelEdgeConfig,
} from "../platforms/index.js";

export interface BundleOptions {
	entry: string;
	outdir: string;
	minify?: boolean;
	sourcemap?: "none" | "inline" | "external";
	external?: string[];
	target?: "bun" | "vercel-edge" | "cloudflare-workers" | "netlify-edge";
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
		// Determine the Bun build target based on deployment platform
		// Edge functions use "browser" target for Web API compatibility
		const bunTarget =
			target === "vercel-edge" ||
			target === "cloudflare-workers" ||
			target === "netlify-edge"
				? "browser"
				: "bun";

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
			target: bunTarget,
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
		const totalSize = result.outputs.reduce(
			(sum, output) => sum + output.size,
			0,
		);
		const sizeInKB = (totalSize / 1024).toFixed(2);

		logger.success(
			`Built in ${logger.cyan(`${duration}s`)} → ${logger.cyan(`${sizeInKB} KB`)}`,
		);

		// Generate platform-specific config files
		if (target === "vercel-edge") {
			await generateVercelEdgeConfig(outdir);
			logger.info("Generated Vercel Edge Function configuration");
		} else if (target === "cloudflare-workers") {
			await generateCloudflareWorkersConfig(outdir);
			logger.info("Generated Cloudflare Workers configuration");
		} else if (target === "netlify-edge") {
			await generateNetlifyEdgeConfig(outdir);
			logger.info("Generated Netlify Edge Function configuration");
		}

		return;
	} catch (error) {
		logger.error(`Bundle error: ${error}`);
		throw error;
	}
}
