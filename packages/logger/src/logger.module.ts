import "reflect-metadata";
import { Logger } from "./logger.service.js";
import { LOGGER_TOKEN, type LoggerOptions } from "./logger.types.js";
import {
	MODULE_METADATA,
	GLOBAL_MODULE,
	type ModuleMetadata,
} from "@dwexjs/common";

/**
 * Options for configuring the LoggerModule
 */
export interface LoggerModuleOptions {
	/**
	 * Make the logger available globally
	 * @default true
	 */
	isGlobal?: boolean;

	/**
	 * Logger configuration options
	 */
	options?: LoggerOptions;
}

/**
 * Logger module for dependency injection.
 * Provides the Logger service to the application.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     LoggerModule.forRoot({
 *       isGlobal: true,
 *       options: {
 *         level: 'debug',
 *         filePath: './logs/app.log'
 *       }
 *     })
 *   ]
 * })
 * class AppModule {}
 * ```
 */
export class LoggerModule {
	static forRoot(config?: LoggerModuleOptions): any {
		// Initialize the global logger with the provided options
		Logger.initialize(config?.options);

		const metadata: ModuleMetadata = {
			providers: [
				{
					provide: LOGGER_TOKEN,
					useClass: Logger,
				},
			],
			exports: [LOGGER_TOKEN],
		};

		// Set metadata manually without decorators
		Reflect.defineMetadata(MODULE_METADATA, metadata, LoggerModule);

		if (config?.isGlobal !== false) {
			Reflect.defineMetadata(GLOBAL_MODULE, true, LoggerModule);
		}

		return LoggerModule;
	}
}

// Set default metadata
const defaultMetadata: ModuleMetadata = {
	providers: [
		{
			provide: LOGGER_TOKEN,
			useClass: Logger,
		},
	],
	exports: [LOGGER_TOKEN],
};
Reflect.defineMetadata(MODULE_METADATA, defaultMetadata, LoggerModule);
Reflect.defineMetadata(GLOBAL_MODULE, true, LoggerModule);
