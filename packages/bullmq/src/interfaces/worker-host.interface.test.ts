import { describe, it, expect } from "vitest";
import { WorkerHost } from "./worker-host.interface.js";
import type { Job } from "bullmq";

describe("WorkerHost", () => {
	it("should be extendable by processor classes", () => {
		class TestProcessor extends WorkerHost {
			async process(job: Job): Promise<any> {
				return { result: job.data };
			}
		}

		const processor = new TestProcessor();
		expect(processor).toBeInstanceOf(WorkerHost);
		expect(processor.process).toBeDefined();
	});

	it("should enforce process method implementation", async () => {
		class TestProcessor extends WorkerHost {
			async process(job: Job): Promise<string> {
				return `Processed: ${job.id}`;
			}
		}

		const processor = new TestProcessor();
		const mockJob = { id: "123", data: {} } as Job;
		const result = await processor.process(mockJob);

		expect(result).toBe("Processed: 123");
	});

	it("should support generic types", async () => {
		interface EmailData {
			to: string;
			subject: string;
		}

		interface EmailResult {
			sent: boolean;
		}

		class EmailProcessor extends WorkerHost<EmailData, EmailResult> {
			async process(job: Job<EmailData>): Promise<EmailResult> {
				return { sent: true };
			}
		}

		const processor = new EmailProcessor();
		const mockJob = {
			id: "1",
			data: { to: "test@example.com", subject: "Test" },
		} as Job<EmailData>;

		const result = await processor.process(mockJob);
		expect(result.sent).toBe(true);
	});
});
