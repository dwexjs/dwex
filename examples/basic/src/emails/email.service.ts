import { Injectable } from "@dwex/core";
import { Logger } from "@dwex/logger";

/**
 * Email service - simplified without BullMQ
 */
@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);

	/**
	 * Send a welcome email
	 */
	async sendWelcomeEmail(email: string, name: string) {
		this.logger.log(`Sending welcome email to ${email}`);
		// Simulate sending email
		await new Promise((resolve) => setTimeout(resolve, 100));

		return {
			message: "Welcome email sent successfully",
			to: email,
			subject: `Welcome ${name}!`,
		};
	}

	/**
	 * Send a notification email
	 */
	async sendNotification(email: string, message: string) {
		this.logger.log(`Sending notification email to ${email}`);
		// Simulate sending email
		await new Promise((resolve) => setTimeout(resolve, 100));

		return {
			message: "Notification email sent successfully",
			to: email,
			subject: "Notification",
		};
	}

	/**
	 * Get email stats (simplified)
	 */
	async getQueueStats() {
		return {
			message: "Email service running (no queue configured)",
			sent: 0,
		};
	}
}
