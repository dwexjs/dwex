import { describe, it, expect } from "vitest";
import "reflect-metadata";
import { Processor } from "./processor.decorator.js";
import { PROCESSOR_METADATA } from "../bullmq.constants.js";
import { INJECTABLE } from "@dwex/common";

describe("@Processor", () => {
	it("should mark class with processor metadata", () => {
		@Processor("test-queue")
		class TestProcessor {}

		const metadata = Reflect.getMetadata(PROCESSOR_METADATA, TestProcessor);
		expect(metadata).toBeDefined();
		expect(metadata.name).toBe("test-queue");
	});

	it("should mark class as injectable", () => {
		@Processor("test-queue")
		class TestProcessor {}

		const isInjectable = Reflect.getMetadata(INJECTABLE, TestProcessor);
		expect(isInjectable).toBe(true);
	});

	it("should store processor options", () => {
		@Processor("test-queue", { concurrency: 5 })
		class TestProcessor {}

		const metadata = Reflect.getMetadata(PROCESSOR_METADATA, TestProcessor);
		expect(metadata.concurrency).toBe(5);
	});
});
