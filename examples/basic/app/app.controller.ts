import { Controller, Get } from "@dwexjs/core";
import { Logger } from "@dwexjs/logger";

/**
 * Main application controller
 */
@Controller()
export class AppController {
	private readonly logger = new Logger(AppController.name);

	/**
	 * Health check endpoint
	 */
	@Get("ping")
	ping() {
		this.logger.log("Ping endpoint called");
		return { message: "pong", timestamp: new Date().toISOString() };
	}

	/**
	 * Root endpoint
	 */
	@Get()
	root() {
		return { message: "Hello World from Dwex!", version: "1.0.0" };
	}
}
