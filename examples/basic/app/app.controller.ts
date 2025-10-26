import { Controller, Get, Injectable, Req, UseGuards } from "@dwex/core";
import { Logger } from "@dwex/logger";
import { AuthGuard } from "./auth.guard";

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

  /**
   * Protected endpoint - requires authentication
   * Access with: Authorization: Bearer <token>
   */
  @Get("profile")
  @UseGuards(AuthGuard)
  getProfile(@Req() req: any) {
    this.logger.log(`Profile accessed by user: ${req.user.username}`);
    return {
      message: "This is a protected route",
      user: req.user,
    };
  }

  /**
   * Protected endpoint - requires authentication
   * Access with: Authorization: Bearer <token>
   */
  @Get("dashboard")
  @UseGuards(AuthGuard)
  getDashboard(@Req() req: any) {
    return {
      message: "Welcome to your dashboard",
      username: req.user.username,
      role: req.user.role,
    };
  }
}
