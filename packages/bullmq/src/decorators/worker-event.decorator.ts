import "reflect-metadata";
import type { WorkerEvent, WorkerEventMetadata } from "../bullmq.types.js";
import { WORKER_EVENTS_METADATA } from "../bullmq.constants.js";

/**
 * Method decorator to handle worker events
 *
 * @param eventName - Name of the worker event to listen to
 *
 * @example
 * ```typescript
 * @Processor('emails')
 * export class EmailProcessor extends WorkerHost {
 *   async process(job: Job) {
 *     // Process the job
 *   }
 *
 *   @OnWorkerEvent('completed')
 *   onCompleted(job: Job, result: any) {
 *     console.log('Job completed:', job.id);
 *   }
 *
 *   @OnWorkerEvent('failed')
 *   onFailed(job: Job, error: Error) {
 *     console.error('Job failed:', job.id, error);
 *   }
 * }
 * ```
 */
export function OnWorkerEvent(eventName: WorkerEvent): MethodDecorator {
	return (
		target: Object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor,
	) => {
		// Get existing event handlers or initialize empty array
		const existingEvents: WorkerEventMetadata[] =
			Reflect.getMetadata(WORKER_EVENTS_METADATA, target.constructor) || [];

		// Add this event handler
		existingEvents.push({
			eventName,
			methodName: propertyKey,
		});

		// Store updated event handlers
		Reflect.defineMetadata(
			WORKER_EVENTS_METADATA,
			existingEvents,
			target.constructor,
		);

		return descriptor;
	};
}
