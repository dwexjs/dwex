import { Processor, WorkerHost, OnWorkerEvent } from "@dwex/bullmq";
import type { Job } from "bullmq";

interface EmailData {
	to: string;
	subject: string;
	body: string;
}

/**
 * Email queue processor
 * Processes email jobs from the 'emails' queue
 */
@Processor("emails", { concurrency: 5 })
export class EmailProcessor extends WorkerHost<EmailData> {
	async process(job: Job<EmailData>): Promise<{ sent: boolean; timestamp: number }> {
		const { to, subject, body } = job.data;

		console.log(`\n📧 Processing email job ${job.id}`);
		console.log(`   To: ${to}`);
		console.log(`   Subject: ${subject}`);
		console.log(`   Body: ${body}`);

		// Simulate email sending delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		console.log(`✅ Email sent successfully to ${to}\n`);

		return {
			sent: true,
			timestamp: Date.now(),
		};
	}

	@OnWorkerEvent("ready")
	onReady() {
		console.log("🚀 Email Worker is ready and listening for jobs");
	}

	@OnWorkerEvent("completed")
	onCompleted(job: Job, result: any) {
		console.log(`✨ Job ${job.id} completed:`, result);
	}

	@OnWorkerEvent("failed")
	onFailed(job: Job, error: Error) {
		console.error(`❌ Job ${job.id} failed:`, error.message);
	}

	@OnWorkerEvent("progress")
	onProgress(job: Job, progress: number) {
		console.log(`📊 Job ${job.id} progress: ${progress}%`);
	}

	@OnWorkerEvent("error")
	onError(error: Error) {
		console.error(`⚠️  Email Worker error:`, error.message);
	}
}
