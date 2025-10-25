import type { JWTPayload } from "jose";

/**
 * Injection token for the JWT service
 */
export const JWT_TOKEN = "JWT_SERVICE";

/**
 * JWT module configuration options
 */
export interface JwtModuleOptions {
	/**
	 * Secret key for signing tokens (for HS256, HS384, HS512)
	 */
	secret?: string;

	/**
	 * Public key for verifying tokens (for RS256, RS384, RS512, ES256, ES384, ES512)
	 */
	publicKey?: string;

	/**
	 * Private key for signing tokens (for RS256, RS384, RS512, ES256, ES384, ES512)
	 */
	privateKey?: string;

	/**
	 * Algorithm for signing tokens
	 * @default 'HS256'
	 */
	algorithm?:
		| "HS256"
		| "HS384"
		| "HS512"
		| "RS256"
		| "RS384"
		| "RS512"
		| "ES256"
		| "ES384"
		| "ES512";

	/**
	 * Default expiration time for tokens
	 * Examples: '1h', '7d', '30m', '2 days'
	 * @default '1h'
	 */
	expiresIn?: string | number;

	/**
	 * Token issuer
	 */
	issuer?: string;

	/**
	 * Token audience
	 */
	audience?: string | string[];
}

/**
 * Options for signing a JWT token
 */
export interface JwtSignOptions {
	/**
	 * Expiration time for the token
	 * Overrides the default expiresIn from module options
	 */
	expiresIn?: string | number;

	/**
	 * Token issuer
	 * Overrides the default issuer from module options
	 */
	issuer?: string;

	/**
	 * Token audience
	 * Overrides the default audience from module options
	 */
	audience?: string | string[];

	/**
	 * JWT ID
	 */
	jti?: string;

	/**
	 * Subject
	 */
	subject?: string;

	/**
	 * Not before (time)
	 */
	notBefore?: string | number;
}

/**
 * Options for verifying a JWT token
 */
export interface JwtVerifyOptions {
	/**
	 * Expected issuer
	 */
	issuer?: string;

	/**
	 * Expected audience
	 */
	audience?: string | string[];

	/**
	 * Maximum token age
	 */
	maxTokenAge?: string | number;

	/**
	 * Whether to ignore expiration
	 * @default false
	 */
	ignoreExpiration?: boolean;
}

/**
 * Result of JWT verification
 */
export interface JwtVerifyResult<T = any> {
	/**
	 * Whether the token is valid
	 */
	valid: boolean;

	/**
	 * Decoded payload if valid
	 */
	payload?: T & JWTPayload;

	/**
	 * Error message if invalid
	 */
	error?: string;
}
