import { describe, it, expect } from "vitest";
import "reflect-metadata";
import { BullMQModule } from "./bullmq.module.js";
import {
	BULLMQ_MODULE_OPTIONS,
	getQueueToken,
	getFlowProducerToken,
} from "./bullmq.constants.js";

describe("BullMQModule", () => {
	describe("forRoot", () => {
		it("should return a dynamic module with options provider", () => {
			const options = {
				connection: { host: "localhost", port: 6379 },
			};

			const module = BullMQModule.forRoot(options);

			expect(module.module).toBe(BullMQModule);
			expect(module.global).toBe(true);
			expect(module.providers).toBeDefined();
			expect(module.providers).toHaveLength(1);
			expect(module.exports).toContain(BULLMQ_MODULE_OPTIONS);
		});
	});

	describe("forRootAsync", () => {
		it("should return a dynamic module with async options provider", () => {
			const module = BullMQModule.forRootAsync({
				useFactory: () => ({
					connection: { host: "localhost", port: 6379 },
				}),
			});

			expect(module.module).toBe(BullMQModule);
			expect(module.global).toBe(true);
			expect(module.providers).toBeDefined();
			expect(module.exports).toContain(BULLMQ_MODULE_OPTIONS);
		});
	});

	describe("registerQueue", () => {
		it("should register queue and flow producer providers", () => {
			const module = BullMQModule.registerQueue({ name: "test-queue" });

			expect(module.module).toBe(BullMQModule);
			expect(module.providers).toBeDefined();
			// Should have Queue and FlowProducer providers
			expect(module.providers?.length).toBeGreaterThanOrEqual(2);
			expect(module.exports).toContain(getQueueToken("test-queue"));
			expect(module.exports).toContain(getFlowProducerToken("test-queue"));
		});

		it("should register multiple queues", () => {
			const module = BullMQModule.registerQueue(
				{ name: "queue1" },
				{ name: "queue2" },
			);

			expect(module.providers?.length).toBeGreaterThanOrEqual(4);
			expect(module.exports).toContain(getQueueToken("queue1"));
			expect(module.exports).toContain(getQueueToken("queue2"));
		});
	});

	describe("registerQueueAsync", () => {
		it("should register queue with async configuration", () => {
			const module = BullMQModule.registerQueueAsync({
				name: "test-queue",
				useFactory: () => ({}),
			});

			expect(module.module).toBe(BullMQModule);
			expect(module.providers).toBeDefined();
			expect(module.exports).toContain(getQueueToken("test-queue"));
		});
	});
});
