import * as clack from "@clack/prompts";
import { Logger } from "../utils/logger.js";

/**
 * Base class for prompts with common functionality
 */
export abstract class BasePrompt<T> {
	/**
	 * Executes the prompt and returns the result
	 * If cliValue is provided, validates and returns it without prompting
	 */
	abstract execute(cliValue?: T): Promise<T>;

	/**
	 * Checks if the user cancelled the prompt
	 */
	protected handleCancel<V>(value: V | symbol): V {
		if (clack.isCancel(value)) {
			Logger.cancel();
		}
		return value as V;
	}
}
