import pc from "picocolors";
import type { CliOptions } from "./types.js";

/**
 * Parses command line arguments into CLI options
 */
export function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		// Check for help flag
		if (arg === "--help" || arg === "-h") {
			options.help = true;
			continue;
		}

		// Check for port option
		if (arg === "--port" || arg === "-p") {
			const portValue = args[++i];
			if (!portValue) {
				console.error(pc.red("Error: --port requires a value"));
				process.exit(1);
			}
			const port = Number.parseInt(portValue);
			if (Number.isNaN(port) || port < 1 || port > 65535) {
				console.error(
					pc.red("Error: Port must be a number between 1 and 65535"),
				);
				process.exit(1);
			}
			options.port = port;
			continue;
		}

		// Check for features option
		if (arg === "--features" || arg === "-f") {
			const featuresValue = args[++i];
			if (!featuresValue) {
				console.error(pc.red("Error: --features requires a value"));
				process.exit(1);
			}
			options.features = featuresValue.split(",").map((f) => f.trim());
			continue;
		}

		// Check for git options
		if (arg === "--git" || arg === "-g") {
			options.git = true;
			continue;
		}

		if (arg === "--no-git") {
			options.noGit = true;
			continue;
		}

		// If no flag prefix, treat as project name
		if (!arg.startsWith("-")) {
			if (!options.projectName) {
				options.projectName = arg;
			} else {
				console.error(pc.red(`Error: Unknown argument: ${arg}`));
				process.exit(1);
			}
		} else {
			console.error(pc.red(`Error: Unknown option: ${arg}`));
			process.exit(1);
		}
	}

	// Validate git options
	if (options.git && options.noGit) {
		console.error(pc.red("Error: Cannot use both --git and --no-git"));
		process.exit(1);
	}

	return options;
}

/**
 * Shows help message
 */
export function showHelp(): void {
	console.log(`
${pc.bold("Usage:")} create-dwex ${pc.cyan("[project-name]")} ${pc.gray("[options]")}

${pc.bold("Arguments:")}
  ${pc.cyan("project-name")}              Name of the project (default: interactive prompt)

${pc.bold("Options:")}
  ${pc.cyan("-p, --port")} ${pc.gray("<number>")}      Port number for the server (default: 9929)
  ${pc.cyan("-f, --features")} ${pc.gray("<list>")}    Comma-separated list of features
  ${pc.cyan("-g, --git")}                 Initialize git repository
  ${pc.cyan("--no-git")}                  Skip git initialization (default)
  ${pc.cyan("-h, --help")}                Show this help message

${pc.bold("Examples:")}
  ${pc.gray("# Interactive mode")}
  $ create-dwex

  ${pc.gray("# With project name only")}
  $ create-dwex my-app

  ${pc.gray("# Full command with all options")}
  $ create-dwex my-app --port 3000 --features auth-jwt,openapi --git

  ${pc.gray("# Without git initialization")}
  $ create-dwex my-app --no-git

${pc.bold("Available Features:")}
  ${pc.cyan("auth-jwt")}                  JWT authentication with guards and decorators
  ${pc.cyan("openapi")}                   OpenAPI/Swagger documentation

${pc.dim("For more information, visit: https://dwexjs.com")}
`);
}
