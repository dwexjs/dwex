import { Body, Controller, Injectable, Post } from "@dwex/core";
import { Logger } from "@dwex/logger";
import { AuthService } from "./auth.service";

/**
 * Authentication controller
 * Handles login endpoint
 */
@Injectable()
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly authService = new AuthService();

  /**
   * Login endpoint
   * POST /auth/login
   * Body: { "username": "admin", "password": "password123" }
   */
  @Post("login")
  async login(@Body() body: any) {
    this.logger.log("Login request received");

    const { username, password } = body;

    if (!username || !password) {
      return {
        success: false,
        message: "Username and password are required",
      };
    }

    const result = await this.authService.login(username, password);

    if (!result) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }

    return {
      success: true,
      message: "Login successful",
      ...result,
    };
  }
}
