import pino, { type Logger as PinoLogger } from "pino";
import "reflect-metadata";
import { INJECTABLE } from "@dwexjs/common";
import type { LoggerOptions, LogLevel, LoggerContext } from "./logger.types.js";

/**
 * Logger service for application-wide logging.
 * Uses Pino under the hood with support for colorful console output,
 * file logging, and context tracking.
 *
 * @example
 * ```typescript
 * class UserService {
 *   constructor(private logger: Logger) {}
 *
 *   findAll() {
 *     this.logger.log('Finding all users', 'UserService');
 *     return users;
 *   }
 * }
 * ```
 */
export class Logger {
	private pinoLogger: PinoLogger;
	private context?: string;
	private static globalLogger?: Logger;

	constructor(options?: LoggerOptions) {
		const isProduction = process.env.NODE_ENV === "production";
		const isDevelopment = !isProduction;

		// Default options
		const defaultOptions: LoggerOptions = {
			level: (process.env.LOG_LEVEL as LogLevel) || "info",
			colorize: isDevelopment,
			prettyPrint: isDevelopment,
		};

		const config = { ...defaultOptions, ...options };

		// Create Pino logger
		const pinoOptions = {
			...config.pinoOptions,
			level: config.level,
		};

		// Use a custom stream for pretty printing
		if (config.prettyPrint) {
			const { Writable } = require("stream");
			const customStream = new Writable({
				write(chunk: Buffer, _encoding: string, callback: () => void) {
					try {
						const log = JSON.parse(chunk.toString());
						const { pid, time, msg, context } = log;

						const date = new Date(time);
						const day = String(date.getDate()).padStart(2, "0");
						const month = String(date.getMonth() + 1).padStart(2, "0");
						const year = date.getFullYear();
						const hours = String(date.getHours()).padStart(2, "0");
						const minutes = String(date.getMinutes()).padStart(2, "0");
						const seconds = String(date.getSeconds()).padStart(2, "0");
						const formattedTime = `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;

						// #BADFDB for [Dwex], green for LOG, #FCF9EA for [context]
						const formatted = `\x1b[38;2;186;223;219m[Dwex]\x1b[39m ${pid} - ${formattedTime}  \x1b[32mLOG\x1b[39m \x1b[38;2;252;249;234m[${context || ""}]\x1b[39m ${msg}`;
						console.log(formatted);
					} catch (error) {
						// Fallback if parsing fails
						console.log(chunk.toString());
					}
					callback();
				},
			});

			this.pinoLogger = pino(pinoOptions, customStream);
		} else {
			this.pinoLogger = pino(pinoOptions);
		}
	}

	/**
	 * Create a child logger with a specific context
	 */
	setContext(context: string): Logger {
		const childLogger = new Logger();
		childLogger.pinoLogger = this.pinoLogger.child({ context });
		childLogger.context = context;
		return childLogger;
	}

	/**
	 * Get or create the global logger instance
	 */
	static getGlobalLogger(options?: LoggerOptions): Logger {
		if (!Logger.globalLogger) {
			Logger.globalLogger = new Logger(options);
		}
		return Logger.globalLogger;
	}

	/**
	 * Log a message at info level
	 */
	log(message: string, context?: string | LoggerContext): void {
		this.info(message, context);
	}

	/**
	 * Log a message at info level
	 */
	info(message: string, context?: string | LoggerContext): void {
		const ctx = this.buildContext(context);
		this.pinoLogger.info(ctx, message);
	}

	/**
	 * Log a message at error level
	 */
	error(
		message: string,
		trace?: string,
		context?: string | LoggerContext,
	): void;
	error(message: string, error?: Error, context?: string | LoggerContext): void;
	error(
		message: string,
		traceOrError?: string | Error,
		context?: string | LoggerContext,
	): void {
		const ctx = this.buildContext(context);

		if (traceOrError instanceof Error) {
			this.pinoLogger.error({ ...ctx, err: traceOrError }, message);
		} else if (typeof traceOrError === "string") {
			this.pinoLogger.error({ ...ctx, trace: traceOrError }, message);
		} else {
			this.pinoLogger.error(ctx, message);
		}
	}

	/**
	 * Log a message at warn level
	 */
	warn(message: string, context?: string | LoggerContext): void {
		const ctx = this.buildContext(context);
		this.pinoLogger.warn(ctx, message);
	}

	/**
	 * Log a message at debug level
	 */
	debug(message: string, context?: string | LoggerContext): void {
		const ctx = this.buildContext(context);
		this.pinoLogger.debug(ctx, message);
	}

	/**
	 * Log a message at trace level
	 */
	trace(message: string, context?: string | LoggerContext): void {
		const ctx = this.buildContext(context);
		this.pinoLogger.trace(ctx, message);
	}

	/**
	 * Log a message at fatal level
	 */
	fatal(message: string, context?: string | LoggerContext): void {
		const ctx = this.buildContext(context);
		this.pinoLogger.fatal(ctx, message);
	}

	/**
	 * Build context object from string or object
	 */
	private buildContext(context?: string | LoggerContext): LoggerContext {
		if (!context) {
			return this.context ? { context: this.context } : {};
		}

		if (typeof context === "string") {
			return { context };
		}

		// Merge with instance context if available
		return this.context ? { context: this.context, ...context } : context;
	}

	/**
	 * Get the underlying Pino logger instance
	 */
	getPinoLogger(): PinoLogger {
		return this.pinoLogger;
	}
}

// Mark Logger as injectable
Reflect.defineMetadata(INJECTABLE, true, Logger);
