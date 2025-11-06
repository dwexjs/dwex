import "reflect-metadata";
import { Queue, Worker, FlowProducer } from "bullmq";
import type { DynamicModule, ModuleMetadata, Provider, Type } from "@dwex/common";
import { MODULE_METADATA } from "@dwex/common";
import type {
	BullMQModuleOptions,
	BullMQModuleAsyncOptions,
	QueueOptions,
	QueueAsyncOptions,
} from "./bullmq.types.js";
import {
	BULLMQ_MODULE_OPTIONS,
	getQueueToken,
	getFlowProducerToken,
} from "./bullmq.constants.js";
import {
	createProcessorFunction,
	getProcessorMetadata,
	wireEventHandlers,
	isProcessor,
} from "./utils/helpers.js";
import type { WorkerHost } from "./interfaces/worker-host.interface.js";

/**
 * BullMQ Module for Dwex
 * 
 * Provides BullMQ integration with Redis-backed job queues, workers, and flow producers.
 *
 * @example
 * ```typescript
 * // Global configuration
 * @Module({
 *   imports: [
 *     BullMQModule.forRoot({
 *       connection: {
 *         host: 'localhost',
 *         port: 6379,
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * // Register queues
 * @Module({
 *   imports: [
 *     BullMQModule.registerQueue({ name: 'emails' }),
 *     BullMQModule.registerQueue({ name: 'notifications' }),
 *   ],
 * })
 * export class TasksModule {}
 * ```
 */
export class BullMQModule {
	/**
	 * Configure BullMQ module with options
	 *
	 * @param options - Global BullMQ configuration
	 * @returns Dynamic module
	 */
	static forRoot(options: BullMQModuleOptions): DynamicModule {
		const optionsProvider: Provider = {
			provide: BULLMQ_MODULE_OPTIONS,
			useValue: options,
		};

		return {
			module: BullMQModule,
			providers: [optionsProvider],
			exports: [BULLMQ_MODULE_OPTIONS],
			global: true,
		};
	}

	/**
	 * Configure BullMQ module with async options
	 *
	 * @param options - Async configuration options
	 * @returns Dynamic module
	 */
	static forRootAsync(options: BullMQModuleAsyncOptions): DynamicModule {
		const optionsProvider: Provider = {
			provide: BULLMQ_MODULE_OPTIONS,
			useFactory: options.useFactory,
			inject: options.inject || [],
		};

		return {
			module: BullMQModule,
			providers: [optionsProvider],
			exports: [BULLMQ_MODULE_OPTIONS],
			global: true,
		};
	}

	/**
	 * Register one or more queues
	 *
	 * @param options - Queue configuration (single or array)
	 * @returns Dynamic module
	 */
	static registerQueue(
		...options: QueueOptions[]
	): DynamicModule {
		const providers: Provider[] = [];

		for (const queueOptions of options) {
			// Queue provider
			providers.push({
				provide: getQueueToken(queueOptions.name),
				useFactory: (moduleOptions: BullMQModuleOptions) => {
					return new Queue(queueOptions.name, {
						connection: moduleOptions.connection as any,
						prefix: moduleOptions.prefix,
						defaultJobOptions: moduleOptions.defaultJobOptions,
						...queueOptions.options,
					});
				},
				inject: [BULLMQ_MODULE_OPTIONS],
			});

			// FlowProducer provider
			providers.push({
				provide: getFlowProducerToken(queueOptions.name),
				useFactory: (moduleOptions: BullMQModuleOptions) => {
					return new FlowProducer({
						connection: moduleOptions.connection as any,
						prefix: moduleOptions.prefix,
					});
				},
				inject: [BULLMQ_MODULE_OPTIONS],
			});
		}

		const exports = options.flatMap((opt) => [
			getQueueToken(opt.name),
			getFlowProducerToken(opt.name),
		]);

		return {
			module: BullMQModule,
			providers,
			exports,
		};
	}

	/**
	 * Register queue with async configuration
	 *
	 * @param options - Async queue configuration
	 * @returns Dynamic module
	 */
	static registerQueueAsync(
		options: QueueAsyncOptions,
	): DynamicModule {
		const providers: Provider[] = [];

		// Queue provider
		providers.push({
			provide: getQueueToken(options.name),
			useFactory: async (
				moduleOptions: BullMQModuleOptions,
				...factoryArgs: any[]
			) => {
				const queueOptions = options.useFactory
					? await options.useFactory(...factoryArgs)
					: {};

				return new Queue(options.name, {
					connection: moduleOptions.connection as any,
					prefix: moduleOptions.prefix,
					defaultJobOptions: moduleOptions.defaultJobOptions,
					...queueOptions,
				});
			},
			inject: [BULLMQ_MODULE_OPTIONS, ...(options.inject || [])],
		});

		// FlowProducer provider
		providers.push({
			provide: getFlowProducerToken(options.name),
			useFactory: (moduleOptions: BullMQModuleOptions) => {
				return new FlowProducer({
					connection: moduleOptions.connection as any,
					prefix: moduleOptions.prefix,
				});
			},
			inject: [BULLMQ_MODULE_OPTIONS],
		});

		const exports = [
			getQueueToken(options.name),
			getFlowProducerToken(options.name),
		];

		return {
			module: BullMQModule,
			providers,
			exports,
		};
	}

	/**
	 * Register processors for queues
	 * 
	 * This method creates Worker instances for processor classes
	 *
	 * @param processors - Array of processor classes
	 * @returns Dynamic module
	 */
	static registerProcessors(...processors: Type<WorkerHost>[]): DynamicModule {
		const providers: Provider[] = [];

		for (const ProcessorClass of processors) {
			if (!isProcessor(ProcessorClass)) {
				continue;
			}

			const metadata = getProcessorMetadata(ProcessorClass);
			
			// Processor instance provider
			providers.push({
				provide: ProcessorClass,
				useClass: ProcessorClass,
			});

			// Worker provider
			providers.push({
				provide: `WORKER:${metadata.name}`,
				useFactory: (
					processorInstance: WorkerHost,
					moduleOptions: BullMQModuleOptions,
				) => {
					const worker = new Worker(
						metadata.name,
						createProcessorFunction(processorInstance),
						{
							connection: moduleOptions.connection as any,
							prefix: moduleOptions.prefix,
							concurrency: metadata.concurrency,
							...metadata.workerOptions,
						},
					);

					// Wire up event handlers
					wireEventHandlers(worker, processorInstance, ProcessorClass);

					return worker;
				},
				inject: [ProcessorClass, BULLMQ_MODULE_OPTIONS],
			});
		}

		return {
			module: BullMQModule,
			providers,
			exports: processors,
		};
	}
}

// Set minimal default metadata so module can be scanned
const defaultMetadata: ModuleMetadata = {
	providers: [],
	exports: [],
};
Reflect.defineMetadata(MODULE_METADATA, defaultMetadata, BullMQModule);
