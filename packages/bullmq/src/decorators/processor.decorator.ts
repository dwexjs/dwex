import "reflect-metadata";
import { INJECTABLE, SCOPE, Scope } from "@dwex/common";
import type { ProcessorOptions } from "../bullmq.types.js";
import { PROCESSOR_METADATA } from "../bullmq.constants.js";

/**
 * Decorator to mark a class as a BullMQ queue processor
 *
 * @param queueName - Name of the queue to process
 * @param options - Optional processor configuration
 *
 * @example
 * ```typescript
 * @Processor('emails')
 * export class EmailProcessor extends WorkerHost {
 *   async process(job: Job) {
 *     console.log('Processing email:', job.data);
 *   }
 * }
 * ```
 */
export function Processor(
	queueName: string,
	options?: Omit<ProcessorOptions, "name">,
): ClassDecorator {
	return (target: Function) => {
		// Mark as injectable
		Reflect.defineMetadata(INJECTABLE, true, target);
		
		// Set scope to singleton by default
		Reflect.defineMetadata(SCOPE, Scope.SINGLETON, target);

		// Store processor metadata
		const processorOptions: ProcessorOptions = {
			name: queueName,
			...options,
		};
		Reflect.defineMetadata(PROCESSOR_METADATA, processorOptions, target);
	};
}
