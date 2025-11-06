import { describe, it, expect } from "vitest";
import "reflect-metadata";
import { getQueueToken } from "../bullmq.constants.js";

describe("@InjectQueue", () => {
	it("should generate correct queue token", () => {
		const token = getQueueToken("emails");
		expect(token).toBe("BULLMQ:QUEUE:emails");
	});

	it("should generate unique tokens for different queues", () => {
		const token1 = getQueueToken("emails");
		const token2 = getQueueToken("notifications");
		expect(token1).not.toBe(token2);
	});
});
