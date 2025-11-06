/**
 * Injection token for the BullMQ module options
 */
export const BULLMQ_MODULE_OPTIONS = Symbol.for("BULLMQ_MODULE_OPTIONS");

/**
 * Prefix for queue injection tokens
 */
export const BULLMQ_QUEUE_PREFIX = "BULLMQ:QUEUE:";

/**
 * Prefix for flow producer injection tokens
 */
export const BULLMQ_FLOW_PREFIX = "BULLMQ:FLOW:";

/**
 * Prefix for queue scheduler injection tokens
 */
export const BULLMQ_SCHEDULER_PREFIX = "BULLMQ:SCHEDULER:";

/**
 * Metadata key for processor information
 */
export const PROCESSOR_METADATA = Symbol.for("dwex:bullmq:processor");

/**
 * Metadata key for worker event handlers
 */
export const WORKER_EVENTS_METADATA = Symbol.for("dwex:bullmq:worker:events");

/**
 * Helper function to generate queue injection token
 */
export function getQueueToken(name: string): string {
	return `${BULLMQ_QUEUE_PREFIX}${name}`;
}

/**
 * Helper function to generate flow producer injection token
 */
export function getFlowProducerToken(name: string): string {
	return `${BULLMQ_FLOW_PREFIX}${name}`;
}

/**
 * Helper function to generate queue scheduler injection token
 */
export function getQueueSchedulerToken(name: string): string {
	return `${BULLMQ_SCHEDULER_PREFIX}${name}`;
}
