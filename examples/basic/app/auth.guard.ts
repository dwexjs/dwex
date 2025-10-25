import {
	Injectable,
	CanActivate,
	type ExecutionContext,
} from "@dwexjs/core";
import { Logger } from "@dwexjs/logger";
import { AuthService } from "./auth.service";

/**
 * Authentication guard
 * Validates JWT tokens from the Authorization header
 */
@Injectable()
export class AuthGuard implements CanActivate {
	private readonly logger = new Logger(AuthGuard.name);
	private readonly authService = new AuthService();

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.getRequest();

		// Get Authorization header
		const authHeader = request.headers.authorization;

		if (!authHeader) {
			this.logger.warn("No authorization header found");
			return false;
		}

		// Check if it starts with "Bearer "
		if (!authHeader.startsWith("Bearer ")) {
			this.logger.warn("Invalid authorization header format");
			return false;
		}

		// Extract token
		const token = authHeader.substring(7);

		if (!token) {
			this.logger.warn("No token found in authorization header");
			return false;
		}

		// Validate token
		const payload = await this.authService.validateToken(token);

		if (!payload) {
			this.logger.warn("Invalid or expired token");
			return false;
		}

		// Attach user payload to request
		request.user = payload;

		this.logger.log(`User authenticated: ${payload.username}`);

		return true;
	}
}
