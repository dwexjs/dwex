import "reflect-metadata";
import type { Job, Worker } from "bullmq";
import type { Type } from "@dwex/common";
import type { WorkerEventMetadata } from "../bullmq.types.js";
import { PROCESSOR_METADATA, WORKER_EVENTS_METADATA } from "../bullmq.constants.js";
import type { WorkerHost } from "../interfaces/worker-host.interface.js";

/**
 * Checks if a class is a processor (has @Processor decorator)
 */
export function isProcessor(target: Type<any>): boolean {
	return Reflect.hasMetadata(PROCESSOR_METADATA, target);
}

/**
 * Gets the processor metadata from a class
 */
export function getProcessorMetadata(target: Type<any>) {
	return Reflect.getMetadata(PROCESSOR_METADATA, target);
}

/**
 * Gets worker event handlers from a processor class
 */
export function getWorkerEventHandlers(
	target: Type<any>,
): WorkerEventMetadata[] {
	return Reflect.getMetadata(WORKER_EVENTS_METADATA, target) || [];
}

/**
 * Wires up event handlers from decorators to a BullMQ Worker instance
 */
export function wireEventHandlers(
	worker: Worker,
	processor: WorkerHost,
	processorClass: Type<any>,
): void {
	const eventHandlers = getWorkerEventHandlers(processorClass);

	for (const handler of eventHandlers) {
		const method = (processor as any)[handler.methodName];
		
		if (typeof method === "function") {
			// Bind the method to the processor instance
			worker.on(handler.eventName, method.bind(processor));
		}
	}
}

/**
 * Creates a processor function for BullMQ Worker
 */
export function createProcessorFunction(processor: WorkerHost) {
	return async (job: Job): Promise<any> => {
		return await processor.process(job);
	};
}
