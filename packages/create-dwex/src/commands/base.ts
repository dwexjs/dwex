import type { ICommand } from "../types.js";

/**
 * Abstract base class for commands
 * Provides common functionality and enforces the command pattern
 */
export abstract class BaseCommand implements ICommand {
	/**
	 * Executes the command
	 * Must be implemented by subclasses
	 */
	abstract execute(): Promise<void>;

	/**
	 * Hook called before execute
	 * Can be overridden by subclasses for setup logic
	 */
	protected async beforeExecute(): Promise<void> {
		// Default: do nothing
	}

	/**
	 * Hook called after execute
	 * Can be overridden by subclasses for cleanup logic
	 */
	protected async afterExecute(): Promise<void> {
		// Default: do nothing
	}

	/**
	 * Runs the command with lifecycle hooks
	 */
	async run(): Promise<void> {
		await this.beforeExecute();
		await this.execute();
		await this.afterExecute();
	}
}
