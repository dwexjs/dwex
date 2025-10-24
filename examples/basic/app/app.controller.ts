import { Controller, Get, Inject } from "@dwexjs/core";
import { Logger, LOGGER_TOKEN } from "@dwexjs/logger";

/**
 * Main application controller
 */
@Controller()
export class AppController {
  constructor(@Inject(LOGGER_TOKEN) private logger: Logger) {}

  /**
   * Health check endpoint
   */
  @Get("ping")
  ping() {
    this.logger.log("Fetching all users", "UserService");
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
