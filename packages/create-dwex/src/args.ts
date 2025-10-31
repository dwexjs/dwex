import { Command, InvalidArgumentError } from "commander";
import pc from "picocolors";
import type { CliOptions } from "./types.js";

/**
 * Creates and configures the Commander program
 */
export function createProgram(version: string): Command {
	const program = new Command();

	program
		.name("create-dwex")
		.description("Scaffolding tool for Dwex applications")
		.version(version, "-v, --version", "Display version number")
		.argument("[project-name]", "Name of the project")
		.option("-p, --port <number>", "Port number for the server", (value) => {
			const port = Number.parseInt(value, 10);
			if (Number.isNaN(port) || port < 1 || port > 65535) {
				throw new InvalidArgumentError(
					"Port must be a number between 1 and 65535",
				);
			}
			return port;
		})
		.option(
			"-f, --features <list>",
			"Comma-separated list of features",
			(value) => {
				return value.split(",").map((f) => f.trim());
			},
		)
		.option(
			"-a, --ai <assistants>",
			"Comma-separated list of AI assistants (claude, cursor, copilot)",
			(value) => {
				const assistants = value.split(",").map((a) => a.trim());
				const validAssistants = ["claude", "cursor", "copilot"];
				const invalid = assistants.filter(
					(a) => !validAssistants.includes(a),
				);
				if (invalid.length > 0) {
					throw new InvalidArgumentError(
						`Invalid AI assistants: ${invalid.join(", ")}. Valid options: ${validAssistants.join(", ")}`,
					);
				}
				return assistants;
			},
		)
		.option("-g, --git", "Initialize git repository")
		.option("--no-git", "Skip git initialization")
		.addHelpText(
			"after",
			`
${pc.bold("Examples:")}
  ${pc.gray("# Interactive mode")}
  $ create-dwex

  ${pc.gray("# With project name only")}
  $ create-dwex my-app

  ${pc.gray("# Full command with all options")}
  $ create-dwex my-app --port 3000 --features auth-jwt,openapi --ai claude,cursor --git

  ${pc.gray("# Without git initialization")}
  $ create-dwex my-app --no-git

${pc.bold("Available Features:")}
  ${pc.cyan("auth-jwt")}                  JWT authentication with guards and decorators
  ${pc.cyan("openapi")}                   OpenAPI/Swagger documentation

${pc.dim("For more information, visit: https://dwexjs.dev/docs/cli")}
`,
		)
		.configureHelp({
			sortOptions: false,
			sortSubcommands: false,
		})
		.showHelpAfterError(true)
		.exitOverride(); // Don't exit on errors, throw instead so we can handle them

	return program;
}

/**
 * Parses command line arguments into CLI options
 */
export function parseArgs(args: string[], version: string): CliOptions {
	const program = createProgram(version);

	try {
		// Parse arguments (args includes executable path, so use default parsing)
		program.parse(args);
	} catch (error) {
		// Commander throws when exitOverride is enabled
		// This handles --help and --version gracefully
		if (error instanceof Error) {
			// Check if this is a help/version request (exit code 0) or an actual error
			if ("exitCode" in error && error.exitCode === 0) {
				process.exit(0);
			}
			// Re-throw actual errors
			console.error(pc.red(`Error: ${error.message}`));
			process.exit(1);
		}
		throw error;
	}

	const opts = program.opts();
	const projectName = program.args[0];

	// Build CLI options
	const options: CliOptions = {
		projectName,
		port: opts.port,
		features: opts.features,
		aiAgents: opts.ai,
	};

	// Handle git options (Commander converts --no-git to git: false)
	if (typeof opts.git === "boolean") {
		options.git = opts.git;
		options.noGit = !opts.git;
	}

	return options;
}
