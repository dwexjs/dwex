import { Injectable } from "@dwex/core";
import { JwtService } from "@dwex/jwt";
import { Logger } from "@dwex/logger";
import { findUserByUsername, type User } from "./users.db";

/**
 * Authentication service
 * Handles user login and token validation
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  /**
   * Validates user credentials and returns a JWT token
   */
  async login(
    username: string,
    password: string
  ): Promise<{ access_token: string; user: Omit<User, "password"> } | null> {
    this.logger.log(`Login attempt for username: ${username}`);

    // Find user by username
    const user = findUserByUsername(username);

    if (!user) {
      this.logger.warn(`User not found: ${username}`);
      return null;
    }

    // Validate password
    // In production, use bcrypt.compare() or argon2.verify()
    if (user.password !== password) {
      this.logger.warn(`Invalid password for user: ${username}`);
      return null;
    }

    // Create JWT payload
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Sign token
    const token = await this.jwtService.sign(payload);

    this.logger.log(`User logged in successfully: ${username}`);

    // Return token and user info (without password)
    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token: token,
      user: userWithoutPassword,
    };
  }

  /**
   * Validates a JWT token
   */
  async validateToken(token: string) {
    const result = await this.jwtService.verify(token);

    if (!result.valid) {
      this.logger.warn(`Invalid token: ${result.error}`);
      return null;
    }

    return result.payload;
  }
}
