import { Controller, Get, Post, Body } from "@dwex/core";
import { Logger } from "@dwex/logger";
import { UsersService } from "./users/users.service";
import { EmailService } from "./emails/email.service";

/**
 * Main application controller
 */
@Controller()
export class AppController {
	private readonly logger = new Logger(AppController.name);

	constructor(
		private usersService: UsersService,
		private emailService: EmailService,
	) {}

	/**
	 * Public root endpoint
	 */
	@Get()
	root() {
		return { message: "Hello World from Dwex!", version: "1.0.0" };
	}

	/**
	 * Public health check endpoint
	 */
	@Get("ping")
	ping() {
		this.logger.log("Ping endpoint called");
		return { message: "pong", timestamp: new Date().toISOString() };
	}

	/**
	 * Get user with products - should fail due to module encapsulation
	 */
	@Get("user/:id")
	getUser() {
		return this.usersService.getUserWithProducts(1);
	}

	/**
	 * Send a welcome email (adds job to queue)
	 */
	@Post("emails/welcome")
	async sendWelcomeEmail(@Body() body: { email: string; name: string }) {
		this.logger.log(`Queueing welcome email for ${body.email}`);
		return this.emailService.sendWelcomeEmail(body.email, body.name);
	}

	/**
	 * Send a notification email (adds job to queue)
	 */
	@Post("emails/notification")
	async sendNotification(@Body() body: { email: string; message: string }) {
		this.logger.log(`Queueing notification email for ${body.email}`);
		return this.emailService.sendNotification(body.email, body.message);
	}

	/**
	 * Get email queue statistics
	 */
	@Get("emails/stats")
	async getEmailQueueStats() {
		return this.emailService.getQueueStats();
	}
}
