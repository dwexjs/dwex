import { Controller, Get, Post, Body, Sse } from "@dwex/core";
import { SseStream } from "@dwex/common";
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

	/**
	 * SSE endpoint using async generator - streams a countdown
	 */
	@Sse("events/countdown")
	async *streamCountdown() {
		this.logger.log("Client connected to countdown stream");

		// Send initial connection message
		yield {
			data: { message: "Connected to countdown stream" },
			event: "connected",
		};

		// Stream countdown from 10 to 1
		for (let i = 10; i >= 1; i--) {
			yield {
				data: { count: i, timestamp: new Date().toISOString() },
				event: "countdown",
				id: String(10 - i + 1),
			};
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		// Send completion message
		yield {
			data: { message: "Countdown complete!" },
			event: "complete",
		};

		this.logger.log("Countdown stream completed");
	}

	/**
	 * SSE endpoint using SseStream - streams server time updates
	 */
	@Sse("events/time")
	streamTime() {
		this.logger.log("Client connected to time stream");

		const stream = new SseStream();

		// Send connection message
		stream.send({
			data: { message: "Connected to time stream" },
			event: "connected",
		});

		let count = 0;
		// Send time updates every second
		const interval = setInterval(() => {
			stream.send({
				data: {
					time: new Date().toISOString(),
					uptime: count++,
				},
				event: "time",
				id: String(count),
			});

			// Send keep-alive comment every 5 seconds
			if (count % 5 === 0) {
				stream.sendComment("keep-alive");
			}

			// Auto-close after 30 seconds
			if (count >= 30) {
				clearInterval(interval);
				stream.send({
					data: { message: "Stream closing after 30 seconds" },
					event: "closing",
				});
				stream.close();
				this.logger.log("Time stream closed after 30 seconds");
			}
		}, 1000);

		// Clean up interval when client disconnects
		stream.onClose(() => {
			clearInterval(interval);
			this.logger.log("Client disconnected from time stream");
		});

		return stream;
	}

	/**
	 * SSE endpoint - streams random events
	 */
	@Sse("events/random")
	async *streamRandomEvents() {
		this.logger.log("Client connected to random events stream");

		yield { data: { message: "Streaming random events..." }, event: "start" };

		const events = ["info", "warning", "success", "error"];
		const messages = [
			"Processing data...",
			"Task completed",
			"Warning: High memory usage",
			"Connection established",
			"Cache cleared",
		];

		for (let i = 0; i < 20; i++) {
			const event = events[Math.floor(Math.random() * events.length)];
			const message = messages[Math.floor(Math.random() * messages.length)];

			yield {
				data: {
					level: event,
					message,
					timestamp: new Date().toISOString(),
				},
				event,
				id: String(i + 1),
				retry: 3000,
			};

			// Random delay between 500ms and 2000ms
			await new Promise((resolve) =>
				setTimeout(resolve, 500 + Math.random() * 1500),
			);
		}

		yield { data: { message: "Stream ended" }, event: "end" };
		this.logger.log("Random events stream completed");
	}
}
