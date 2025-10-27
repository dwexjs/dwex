import chalk from "chalk";

/**
 * Logger utility for consistent CLI output
 */
export const logger = {
	info: (message: string) => {
		console.log(chalk.blue("ℹ"), message);
	},

	success: (message: string) => {
		console.log(chalk.green("✔"), message);
	},

	warn: (message: string) => {
		console.log(chalk.yellow("⚠"), message);
	},

	error: (message: string) => {
		console.log(chalk.red("✖"), message);
	},

	log: (message: string) => {
		console.log(message);
	},

	newline: () => {
		console.log();
	},

	clear: () => {
		console.clear();
	},

	dim: (message: string) => chalk.dim(message),
	bold: (message: string) => chalk.bold(message),
	cyan: (message: string) => chalk.cyan(message),
	green: (message: string) => chalk.green(message),
	yellow: (message: string) => chalk.yellow(message),
	red: (message: string) => chalk.red(message),
};
