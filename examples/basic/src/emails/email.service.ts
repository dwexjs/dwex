import { Injectable, Inject } from "@dwex/core";
import { getQueueToken } from "@dwex/bullmq";
import type { Queue } from "bullmq";

/**
 * Email service that adds jobs to the email queue
 */
@Injectable()
export class EmailService {
	constructor(@Inject(getQueueToken("emails")) private emailQueue: Queue) {}

	/**
	 * Send a welcome email
	 */
	async sendWelcomeEmail(email: string, name: string) {
		const job = await this.emailQueue.add("welcome", {
			to: email,
			subject: `Welcome ${name}!`,
			body: `Hi ${name}, welcome to our application!`,
		});

		return {
			jobId: job.id,
			message: "Welcome email queued successfully",
		};
	}

	/**
	 * Send a notification email
	 */
	async sendNotification(email: string, message: string) {
		const job = await this.emailQueue.add("notification", {
			to: email,
			subject: "Notification",
			body: message,
		});

		return {
			jobId: job.id,
			message: "Notification email queued successfully",
		};
	}

	/**
	 * Get queue statistics
	 */
	async getQueueStats() {
		const [waiting, active, completed, failed] = await Promise.all([
			this.emailQueue.getWaitingCount(),
			this.emailQueue.getActiveCount(),
			this.emailQueue.getCompletedCount(),
			this.emailQueue.getFailedCount(),
		]);

		return {
			waiting,
			active,
			completed,
			failed,
			total: waiting + active + completed + failed,
		};
	}
}
