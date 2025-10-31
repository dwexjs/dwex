import * as clack from "@clack/prompts";
import pc from "picocolors";

/**
 * Logger utility for consistent output formatting
 */
export class Logger {
	/**
	 * Displays intro message
	 */
	static intro(message: string): void {
		console.log();
		clack.intro(pc.bgCyan(pc.black(message)));
	}

	/**
	 * Displays outro message
	 */
	static outro(message: string, isError = false): void {
		if (isError) {
			clack.outro(pc.red(message));
		} else {
			clack.outro(message);
		}
	}

	/**
	 * Displays a note
	 */
	static note(message: string, title?: string): void {
		clack.note(message, title);
	}

	/**
	 * Displays cancellation message and exits
	 */
	static cancel(message = "Operation cancelled"): void {
		clack.cancel(message);
		process.exit(0);
	}

	/**
	 * Displays error message and exits
	 */
	static error(message: string, error?: unknown): never {
		clack.outro(pc.red(message));
		if (error) {
			console.error(error);
		}
		process.exit(1);
	}

	/**
	 * Creates a spinner
	 */
	static spinner(): ReturnType<typeof clack.spinner> {
		return clack.spinner();
	}

	/**
	 * Logs a success message
	 */
	static success(message: string): void {
		console.log(pc.green(message));
	}

	/**
	 * Logs a warning message
	 */
	static warning(message: string): void {
		console.log(pc.yellow(message));
	}

	/**
	 * Logs an info message
	 */
	static info(message: string): void {
		console.log(pc.cyan(message));
	}

	/**
	 * Logs a gray/dim message
	 */
	static dim(message: string): void {
		console.log(pc.gray(message));
	}
}
