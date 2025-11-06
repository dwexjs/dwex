import { describe, it, expect } from "vitest";
import "reflect-metadata";
import {
	isProcessor,
	getProcessorMetadata,
	getWorkerEventHandlers,
} from "./helpers.js";
import { Processor } from "../decorators/processor.decorator.js";
import { WorkerHost } from "../interfaces/worker-host.interface.js";
import type { Job } from "bullmq";

describe("Helpers", () => {
	describe("isProcessor", () => {
		it("should return true for classes with @Processor decorator", () => {
			@Processor("test")
			class TestProcessor extends WorkerHost {
				async process(job: Job): Promise<any> {
					return {};
				}
			}

			expect(isProcessor(TestProcessor)).toBe(true);
		});

		it("should return false for classes without @Processor decorator", () => {
			class TestClass {}

			expect(isProcessor(TestClass)).toBe(false);
		});
	});

	describe("getProcessorMetadata", () => {
		it("should return processor metadata", () => {
			@Processor("test-queue", { concurrency: 3 })
			class TestProcessor extends WorkerHost {
				async process(job: Job): Promise<any> {
					return {};
				}
			}

			const metadata = getProcessorMetadata(TestProcessor);
			expect(metadata.name).toBe("test-queue");
			expect(metadata.concurrency).toBe(3);
		});
	});

	describe("getWorkerEventHandlers", () => {
		it("should return worker event handlers metadata", () => {
			// Test that the helper function exists and returns an array
			@Processor("test")
			class TestProcessor extends WorkerHost {
				async process(job: Job): Promise<any> {
					return {};
				}
			}

			const handlers = getWorkerEventHandlers(TestProcessor);
			expect(Array.isArray(handlers)).toBe(true);
		});

		it("should return empty array for processor without event handlers", () => {
			@Processor("test")
			class TestProcessor extends WorkerHost {
				async process(job: Job): Promise<any> {
					return {};
				}
			}

			const handlers = getWorkerEventHandlers(TestProcessor);
			expect(handlers).toEqual([]);
		});
	});
});
