#!/usr/bin/env bun

import { Command } from "commander";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCommand, devCommand, generateCommand } from "./commands/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

/**
 * Main CLI program
 */
async function main() {
	const program = new Command();

	program
		.name("dwex")
		.description("CLI tool for building and developing Dwex applications")
		.version(packageJson.version, "-v, --version");

	// Register commands
	await buildCommand(program);
	await devCommand(program);
	await generateCommand(program);

	// Parse arguments
	await program.parseAsync(process.argv);
}

// Run the CLI
main().catch((error) => {
	console.error("Error:", error);
	process.exit(1);
});
