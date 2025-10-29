import { Controller, Get, Injectable } from "@dwex/core";
import { ApiOkResponse, ApiOperation, ApiTags } from "@dwex/openapi";

/**
 * Main application controller
 */
@Injectable()
@Controller()
@ApiTags("general")
export class AppController {
	/**
	 * Root endpoint
	 */
	@Get()
	@ApiOperation({
		summary: "Get API info",
		description: "Returns basic information about the API",
	})
	@ApiOkResponse({
		description: "API information",
	})
	root() {
		return {
			message: "Welcome to Dwex OpenAPI Example API",
			version: "1.0.0",
			documentation: "/docs",
		};
	}

	/**
	 * Health check endpoint
	 */
	@Get("health")
	@ApiOperation({
		summary: "Health check",
		description: "Returns the health status of the API",
	})
	@ApiOkResponse({
		description: "Health status",
	})
	health() {
		return {
			status: "ok",
			timestamp: new Date().toISOString(),
		};
	}
}
