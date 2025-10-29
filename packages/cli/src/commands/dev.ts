import { spawn } from "node:child_process";
import type { Command } from "commander";
import { loadConfig } from "../config/index.js";
import { logger, resolveProjectPath } from "../utils/index.js";

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

			// Use Bun's --watch flag for hot reload
			const bunProcess = spawn("bun", ["run", "--watch", entryPath], {
				stdio: ["inherit", "pipe", "pipe"],
				env: {
					...process.env,
					PORT: String(port),
					NODE_ENV: "development",
				},
			});

			bunProcess.stdout?.on("data", (data) => {
				const output = data.toString();
				process.stdout.write(output);
			});

			bunProcess.stderr?.on("data", (data) => {
				const output = data.toString();
				process.stderr.write(output);
			});

			bunProcess.on("error", (error) => {
				logger.error(error.message);
				process.exit(1);
			});

			bunProcess.on("close", (code) => {
				if (code !== 0 && code !== null) {
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
