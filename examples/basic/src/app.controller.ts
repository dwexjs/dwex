import { Controller, Get, Injectable } from "@dwex/core";
import { Logger } from "@dwex/logger";

/**
 * Main application controller
 */
@Injectable()
@Controller()
export class AppController {
	private readonly logger = new Logger(AppController.name);

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
}
