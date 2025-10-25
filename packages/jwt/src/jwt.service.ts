import { SignJWT, jwtVerify, decodeJwt, type JWTPayload } from "jose";
import "reflect-metadata";
import { INJECTABLE } from "@dwexjs/common";
import type {
	JwtModuleOptions,
	JwtSignOptions,
	JwtVerifyOptions,
	JwtVerifyResult,
} from "./jwt.types.js";

/**
 * JWT service for signing and verifying JWT tokens.
 * Uses the jose library under the hood for secure JWT operations.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class AuthService {
 *   private readonly jwtService = new JwtService({
 *     secret: process.env.JWT_SECRET,
 *     expiresIn: '1h'
 *   });
 *
 *   async login(user: User) {
 *     const payload = { sub: user.id, email: user.email };
 *     const token = await this.jwtService.sign(payload);
 *     return { access_token: token };
 *   }
 *
 *   async validateToken(token: string) {
 *     const result = await this.jwtService.verify(token);
 *     return result.valid ? result.payload : null;
 *   }
 * }
 * ```
 */
export class JwtService {
	private readonly options: JwtModuleOptions;

	constructor(options?: JwtModuleOptions) {
		this.options = {
			algorithm: "HS256",
			expiresIn: "1h",
			...options,
		};

		// Validate that we have the required keys
		if (
			!this.options.secret &&
			!this.options.privateKey &&
			!this.options.publicKey
		) {
			throw new Error(
				"JwtService requires either secret, privateKey, or publicKey",
			);
		}
	}

	/**
	 * Signs a payload and returns a JWT token.
	 *
	 * @param payload - The data to encode in the token
	 * @param options - Optional signing options
	 * @returns Signed JWT token string
	 *
	 * @example
	 * ```typescript
	 * const token = await jwtService.sign(
	 *   { userId: 123, role: 'admin' },
	 *   { expiresIn: '7d' }
	 * );
	 * ```
	 */
	async sign(
		payload: Record<string, any>,
		options?: JwtSignOptions,
	): Promise<string> {
		const signOptions = { ...this.options, ...options };

		// Create JWT instance and set algorithm in protected header
		let jwt = new SignJWT(payload).setProtectedHeader({
			alg: signOptions.algorithm || "HS256",
		});

		// Set standard claims
		if (signOptions.issuer) {
			jwt = jwt.setIssuer(signOptions.issuer);
		}

		if (signOptions.audience) {
			jwt = jwt.setAudience(signOptions.audience);
		}

		if (signOptions.subject) {
			jwt = jwt.setSubject(signOptions.subject);
		}

		if (signOptions.jti) {
			jwt = jwt.setJti(signOptions.jti);
		}

		// Set expiration
		if (signOptions.expiresIn) {
			const exp =
				typeof signOptions.expiresIn === "string"
					? signOptions.expiresIn
					: `${signOptions.expiresIn}s`;
			jwt = jwt.setExpirationTime(exp);
		}

		// Set not before
		if (signOptions.notBefore) {
			const nbf =
				typeof signOptions.notBefore === "string"
					? signOptions.notBefore
					: `${signOptions.notBefore}s`;
			jwt = jwt.setNotBefore(nbf);
		}

		// Set issued at
		jwt = jwt.setIssuedAt();

		// Get the signing key
		const key = await this.getSigningKey();

		// Sign the token
		return await jwt.sign(key);
	}

	/**
	 * Verifies a JWT token and returns the decoded payload.
	 *
	 * @param token - The JWT token to verify
	 * @param options - Optional verification options
	 * @returns Verification result with payload if valid
	 *
	 * @example
	 * ```typescript
	 * const result = await jwtService.verify(token);
	 * if (result.valid) {
	 *   console.log('User ID:', result.payload.userId);
	 * } else {
	 *   console.error('Invalid token:', result.error);
	 * }
	 * ```
	 */
	async verify<T = any>(
		token: string,
		options?: JwtVerifyOptions,
	): Promise<JwtVerifyResult<T>> {
		try {
			const key = await this.getVerificationKey();

			const verifyOptions: any = {};

			if (options?.issuer || this.options.issuer) {
				verifyOptions.issuer = options?.issuer || this.options.issuer;
			}

			if (options?.audience || this.options.audience) {
				verifyOptions.audience = options?.audience || this.options.audience;
			}

			if (options?.maxTokenAge) {
				verifyOptions.maxTokenAge = options.maxTokenAge;
			}

			const { payload } = await jwtVerify(token, key, verifyOptions);

			return {
				valid: true,
				payload: payload as T & JWTPayload,
			};
		} catch (error) {
			return {
				valid: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Decodes a JWT token without verifying its signature.
	 * WARNING: This does not validate the token! Use verify() for secure validation.
	 *
	 * @param token - The JWT token to decode
	 * @returns Decoded payload or null if invalid
	 *
	 * @example
	 * ```typescript
	 * const payload = jwtService.decode(token);
	 * console.log('Token claims:', payload);
	 * ```
	 */
	decode<T = any>(token: string): (T & JWTPayload) | null {
		try {
			return decodeJwt(token) as T & JWTPayload;
		} catch {
			return null;
		}
	}

	/**
	 * Gets the signing key based on the configured algorithm and keys.
	 */
	private async getSigningKey(): Promise<Uint8Array> {
		if (this.options.privateKey) {
			// For asymmetric algorithms (RS*, ES*)
			const encoder = new TextEncoder();
			return encoder.encode(this.options.privateKey);
		}

		if (this.options.secret) {
			// For symmetric algorithms (HS*)
			const encoder = new TextEncoder();
			return encoder.encode(this.options.secret);
		}

		throw new Error("No signing key available");
	}

	/**
	 * Gets the verification key based on the configured algorithm and keys.
	 */
	private async getVerificationKey(): Promise<Uint8Array> {
		if (this.options.publicKey) {
			// For asymmetric algorithms (RS*, ES*)
			const encoder = new TextEncoder();
			return encoder.encode(this.options.publicKey);
		}

		if (this.options.secret) {
			// For symmetric algorithms (HS*)
			const encoder = new TextEncoder();
			return encoder.encode(this.options.secret);
		}

		throw new Error("No verification key available");
	}
}

// Mark JwtService as injectable
Reflect.defineMetadata(INJECTABLE, true, JwtService);
