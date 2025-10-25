import "reflect-metadata";
import { JwtService } from "./jwt.service.js";
import { JWT_TOKEN, type JwtModuleOptions } from "./jwt.types.js";
import {
	MODULE_METADATA,
	GLOBAL_MODULE,
	type ModuleMetadata,
} from "@dwexjs/common";

/**
 * Options for configuring the JwtModule
 */
export interface JwtModuleConfig {
	/**
	 * Make the JWT service available globally
	 * @default false
	 */
	isGlobal?: boolean;

	/**
	 * JWT configuration options
	 */
	options: JwtModuleOptions;
}

/**
 * JWT module for dependency injection.
 * Provides the JwtService to the application.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     JwtModule.forRoot({
 *       isGlobal: true,
 *       options: {
 *         secret: process.env.JWT_SECRET,
 *         expiresIn: '1h',
 *         issuer: 'my-app'
 *       }
 *     })
 *   ]
 * })
 * class AppModule {}
 * ```
 */
export class JwtModule {
	static forRoot(config: JwtModuleConfig): any {
		// Create a factory function that returns a JwtService instance
		const jwtServiceFactory = () => {
			return new JwtService(config.options);
		};

		const metadata: ModuleMetadata = {
			providers: [
				{
					provide: JWT_TOKEN,
					useFactory: jwtServiceFactory,
				},
			],
			exports: [JWT_TOKEN],
		};

		// Set metadata manually without decorators
		Reflect.defineMetadata(MODULE_METADATA, metadata, JwtModule);

		if (config.isGlobal) {
			Reflect.defineMetadata(GLOBAL_MODULE, true, JwtModule);
		}

		return JwtModule;
	}
}
