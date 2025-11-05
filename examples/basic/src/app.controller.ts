import { Controller, Get, Injectable } from "@dwex/core";
import { Logger } from "@dwex/logger";
import { UsersService } from "./users/users.service";

/**
 * Main application controller
 */
@Controller()
export class AppController {
	private readonly logger = new Logger(AppController.name);

	constructor(private usersService: UsersService) {}

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
}
