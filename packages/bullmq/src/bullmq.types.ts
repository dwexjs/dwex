import type { ConnectionOptions, JobsOptions, QueueOptions as BullQueueOptions, WorkerOptions } from "bullmq";
import type { Type } from "@dwex/common";

/**
 * Options for configuring the BullMQ module globally
 */
export interface BullMQModuleOptions {
	/**
	 * Redis connection configuration
	 * Can be a ConnectionOptions object or a Redis URL string
	 */
	connection: ConnectionOptions | string;

	/**
	 * Default job options applied to all queues
	 */
	defaultJobOptions?: JobsOptions;

	/**
	 * Prefix for all queue names (optional)
	 */
	prefix?: string;
}

/**
 * Async configuration options for BullMQ module
 */
export interface BullMQModuleAsyncOptions {
	/**
	 * Factory function to create module options
	 */
	useFactory: (
		...args: any[]
	) => Promise<BullMQModuleOptions> | BullMQModuleOptions;

	/**
	 * Dependencies to inject into the factory function
	 */
	inject?: Array<Type<any> | string | symbol>;
}

/**
 * Options for registering a single queue
 */
export interface QueueOptions {
	/**
	 * Name of the queue
	 */
	name: string;

	/**
	 * Queue-specific options (BullMQ QueueOptions)
	 */
	options?: Omit<BullQueueOptions, "connection">;
}

/**
 * Async options for registering a queue
 */
export interface QueueAsyncOptions {
	/**
	 * Name of the queue
	 */
	name: string;

	/**
	 * Factory function to create queue options
	 */
	useFactory?: (
		...args: any[]
	) => Promise<Omit<BullQueueOptions, "connection">> | Omit<BullQueueOptions, "connection">;

	/**
	 * Dependencies to inject into the factory function
	 */
	inject?: Array<Type<any> | string | symbol>;
}

/**
 * Options for configuring a processor
 */
export interface ProcessorOptions {
	/**
	 * Queue name this processor handles
	 */
	name?: string;

	/**
	 * Worker concurrency (number of jobs to process in parallel)
	 */
	concurrency?: number;

	/**
	 * Additional worker options
	 */
	workerOptions?: Omit<WorkerOptions, "connection" | "concurrency">;
}

/**
 * Worker event types that can be listened to
 */
export type WorkerEvent =
	| "active"
	| "completed"
	| "failed"
	| "progress"
	| "stalled"
	| "drained"
	| "error"
	| "ready"
	| "closed"
	| "paused"
	| "resumed";

/**
 * Metadata for worker event handlers
 */
export interface WorkerEventMetadata {
	/**
	 * Event name to listen to
	 */
	eventName: WorkerEvent;

	/**
	 * Method name that handles the event
	 */
	methodName: string | symbol;
}
