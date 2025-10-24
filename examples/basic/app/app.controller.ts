import { Controller, Get } from "@dwexjs/core";

/**
 * Main application controller
 */
@Controller()
export class AppController {
	/**
	 * Health check endpoint
	 */
	@Get("ping")
	ping() {
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
