import "reflect-metadata";
import {
  type DynamicModule,
  MODULE_METADATA,
  type ModuleMetadata,
} from "@dwex/common";
import { JwtService } from "./jwt.service.js";
import { JWT_TOKEN, type JwtModuleOptions } from "./jwt.types.js";

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
 * Options for JwtModule.register() - NestJS-like API
 */
export interface JwtModuleRegisterOptions extends JwtModuleOptions {
  /**
   * Make the JWT service available globally
   * @default false
   */
  global?: boolean;

  /**
   * Sign options (alias for convenience)
   */
  signOptions?: {
    expiresIn?: string | number;
    issuer?: string;
    audience?: string | string[];
  };
}

/**
 * JWT module for dependency injection.
 * Provides the JwtService to the application.
 *
 * @example
 * ```typescript
 * // Using register() - NestJS-like API
 * @Module({
 *   imports: [
 *     JwtModule.register({
 *       global: true,
 *       secret: process.env.JWT_SECRET,
 *       signOptions: { expiresIn: '60s' },
 *     })
 *   ]
 * })
 * class AppModule {}
 *
 * // Using forRoot() - original API
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
  /**
   * Register the JWT module with configuration (NestJS-like API)
   *
   * @param options - JWT configuration options
   * @returns Dynamic module with providers
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     JwtModule.register({
   *       global: true,
   *       secret: 'my-secret-key',
   *       signOptions: { expiresIn: '60s' },
   *     })
   *   ]
   * })
   * class AppModule {}
   * ```
   */
  static register(options: JwtModuleRegisterOptions): DynamicModule {
    const { global, signOptions, ...jwtOptions } = options;

    // Merge signOptions into the main options
    const mergedOptions: JwtModuleOptions = {
      ...jwtOptions,
      ...(signOptions?.expiresIn && { expiresIn: signOptions.expiresIn }),
      ...(signOptions?.issuer && { issuer: signOptions.issuer }),
      ...(signOptions?.audience && { audience: signOptions.audience }),
    };

    // Create a shared singleton instance
    const jwtServiceInstance = new JwtService(mergedOptions);

    return {
      module: JwtModule,
      providers: [
        {
          provide: JwtService,
          useValue: jwtServiceInstance,
        },
        {
          provide: JWT_TOKEN,
          useValue: jwtServiceInstance,
        },
      ],
      exports: [JwtService, JWT_TOKEN],
      global,
    };
  }

  /**
   * Register the JWT module with configuration (original API)
   *
   * @param config - JWT module configuration
   * @returns Dynamic module with providers
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
   *       }
   *     })
   *   ]
   * })
   * class AppModule {}
   * ```
   */
  static forRoot(config: JwtModuleConfig): DynamicModule {
    // Create the JwtService instance with the provided options
    const jwtServiceInstance = new JwtService(config.options);

    return {
      module: JwtModule,
      providers: [
        {
          provide: JWT_TOKEN,
          useValue: jwtServiceInstance,
        },
      ],
      exports: [JWT_TOKEN],
      global: config.isGlobal,
    };
  }
}

// Set minimal default metadata so JwtModule can be scanned
const defaultMetadata: ModuleMetadata = {
  providers: [],
  exports: [],
};
Reflect.defineMetadata(MODULE_METADATA, defaultMetadata, JwtModule);
