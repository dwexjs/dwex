import { spawn } from "node:child_process";
import type { Command } from "commander";
import { loadConfig } from "../config/index.js";
import { logger, resolveProjectPath } from "../utils/index.js";
import ora from "ora";

/**
 * Development command - runs the app with hot reload
 */
export async function devCommand(program: Command): Promise<void> {
	program
		.command("dev")
		.description("Start development server with hot reload")
		.option("-p, --port <port>", "Port to run the server on")
		.action(async (options) => {
			const config = await loadConfig();
			const entryPath = resolveProjectPath(config.entry);
			const port = options.port || config.port;

			// Set PORT environment variable
			process.env.PORT = String(port);

			logger.clear();
			logger.info(
				`Starting ${logger.cyan("Dwex")} development server...\n`,
			);

			const spinner = ora({
				text: "Starting server...",
				color: "cyan",
			}).start();

			let startTime = Date.now();
			let isFirstStart = true;

			// Use Bun's --watch flag for hot reload
			const bunProcess = spawn(
				"bun",
				["run", "--watch", entryPath],
				{
					stdio: ["inherit", "pipe", "pipe"],
					env: {
						...process.env,
						PORT: String(port),
						NODE_ENV: "development",
					},
				},
			);

			bunProcess.stdout?.on("data", (data) => {
				const output = data.toString();

				// Detect when server is ready
				if (output.includes("listening") || output.includes("Listening") || output.includes("Server running")) {
					const duration = Date.now() - startTime;

					if (isFirstStart) {
						spinner.succeed(
							logger.green(
								`Server ready in ${logger.cyan(`${duration}ms`)}`,
							),
						);
						logger.log(`\n  ${logger.dim("➜")}  Local:   ${logger.cyan(`http://localhost:${port}`)}`);
						logger.log(`  ${logger.dim("➜")}  Watching for changes...\n`);
						isFirstStart = false;
					} else {
						logger.clear();
						logger.success(
							`Server restarted in ${logger.cyan(`${duration}ms`)}`,
						);
						logger.log(`  ${logger.dim("➜")}  Local:   ${logger.cyan(`http://localhost:${port}`)}\n`);
					}
				}

				// Print other output
				if (!output.includes("listening") && !output.includes("Listening")) {
					process.stdout.write(output);
				}
			});

			bunProcess.stderr?.on("data", (data) => {
				const output = data.toString();

				// Detect file change
				if (output.includes("change detected")) {
					logger.clear();
					logger.info("File change detected, restarting...");
					startTime = Date.now();
				} else {
					process.stderr.write(output);
				}
			});

			bunProcess.on("error", (error) => {
				spinner.fail(logger.red("Failed to start server"));
				logger.error(error.message);
				process.exit(1);
			});

			bunProcess.on("close", (code) => {
				if (code !== 0 && code !== null) {
					spinner.fail(logger.red(`Server exited with code ${code}`));
					process.exit(code);
				}
			});

			// Handle graceful shutdown
			process.on("SIGINT", () => {
				logger.log("\n");
				logger.info("Shutting down development server...");
				bunProcess.kill();
				process.exit(0);
			});

			process.on("SIGTERM", () => {
				bunProcess.kill();
				process.exit(0);
			});
		});
}
