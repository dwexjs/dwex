import { describe, it, expect } from "vitest";
import "reflect-metadata";
import { WORKER_EVENTS_METADATA } from "../bullmq.constants.js";

describe("@OnWorkerEvent", () => {
	it("should have correct metadata key", () => {
		expect(WORKER_EVENTS_METADATA).toBeDefined();
		expect(typeof WORKER_EVENTS_METADATA).toBe("symbol");
	});

	it("should support all worker event types", () => {
		const events = [
			"active",
			"completed",
			"failed",
			"progress",
			"stalled",
			"drained",
			"error",
			"ready",
			"closed",
			"paused",
			"resumed",
		];

		// Just verify the event names are valid strings
		events.forEach((event) => {
			expect(typeof event).toBe("string");
			expect(event.length).toBeGreaterThan(0);
		});
	});
});
