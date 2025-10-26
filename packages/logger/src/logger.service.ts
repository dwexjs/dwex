import pino, { type Logger as PinoLogger } from "pino";
import "reflect-metadata";
import { INJECTABLE } from "@dwex/common";
import type { LoggerOptions, LogLevel } from "./logger.types.js";

/**
 * Logger service for application-wide logging.
 * Uses Pino under the hood with support for colorful console output,
 * file logging, and context tracking.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class UserService {
 *   private readonly logger = new Logger(UserService.name);
 *
 *   findAll() {
 *     this.logger.log('Finding all users');
 *     return users;
 *   }
 * }
 * ```
 */
export class Logger {
  private static sharedPinoLogger?: PinoLogger;
  private readonly context?: string;

  constructor(context?: string) {
    this.context = context;

    // Initialize with default config if not already initialized
    if (!Logger.sharedPinoLogger) {
      Logger.initialize();
    }
  }

  /**
   * Initialize the global logger configuration.
   * This should be called by LoggerModule during application bootstrap.
   */
  static initialize(options?: LoggerOptions): void {
    // Only initialize once
    if (Logger.sharedPinoLogger) {
      return;
    }

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
            const { time, msg, context, level } = log;

            // Map pino level numbers to level names and colors
            const levelMap: Record<number, { name: string; color: string }> = {
              10: { name: "TRACE", color: "\x1b[38;2;186;223;219m" }, // #BADFDB
              20: { name: "DEBUG", color: "\x1b[38;2;186;223;219m" }, // #BADFDB
              30: { name: "LOG", color: "\x1b[38;2;252;249;234m" }, // #FCF9EA
              40: { name: "WARN", color: "\x1b[38;2;255;189;189m" }, // #FFBDBD
              50: { name: "ERROR", color: "\x1b[38;2;255;164;164m" }, // #FFA4A4
              60: { name: "FATAL", color: "\x1b[38;2;255;164;164m" }, // #FFA4A4
            };

            const levelInfo = levelMap[level] || {
              name: "LOG",
              color: "\x1b[38;2;252;249;234m",
            };

            // Format time as HH:MM:SS
            const date = new Date(time);
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            const seconds = String(date.getSeconds()).padStart(2, "0");
            const formattedTime = `${hours}:${minutes}:${seconds}`;

            // Minimal format: HH:MM:SS  LEVEL [SERVICE] MESSAGE
            // Pad level name to 5 characters for consistent alignment (spacing before)
            const paddedLevel = levelInfo.name.padStart(5, " ");
            const formatted = `\x1b[90m${formattedTime}\x1b[39m ${levelInfo.color}${paddedLevel}\x1b[39m \x1b[38;2;186;223;219m[${context || "App"}]\x1b[39m ${msg}`;
            console.log(formatted);
          } catch (error) {
            // Fallback if parsing fails
            console.log(chunk.toString());
          }
          callback();
        },
      });

      Logger.sharedPinoLogger = pino(pinoOptions, customStream);
    } else {
      Logger.sharedPinoLogger = pino(pinoOptions);
    }
  }

  /**
   * Log a message at info level
   */
  log(message: string): void {
    this.info(message);
  }

  /**
   * Log a message at info level
   */
  info(message: string): void {
    const ctx = this.context ? { context: this.context } : {};
    Logger.sharedPinoLogger!.info(ctx, message);
  }

  /**
   * Log a message at error level
   */
  error(message: string, trace?: string): void;
  error(message: string, error?: Error): void;
  error(message: string, traceOrError?: string | Error): void {
    const ctx = this.context ? { context: this.context } : {};

    if (traceOrError instanceof Error) {
      Logger.sharedPinoLogger!.error({ ...ctx, err: traceOrError }, message);
    } else if (typeof traceOrError === "string") {
      Logger.sharedPinoLogger!.error({ ...ctx, trace: traceOrError }, message);
    } else {
      Logger.sharedPinoLogger!.error(ctx, message);
    }
  }

  /**
   * Log a message at warn level
   */
  warn(message: string): void {
    const ctx = this.context ? { context: this.context } : {};
    Logger.sharedPinoLogger!.warn(ctx, message);
  }

  /**
   * Log a message at debug level
   */
  debug(message: string): void {
    const ctx = this.context ? { context: this.context } : {};
    Logger.sharedPinoLogger!.debug(ctx, message);
  }

  /**
   * Log a message at trace level
   */
  trace(message: string): void {
    const ctx = this.context ? { context: this.context } : {};
    Logger.sharedPinoLogger!.trace(ctx, message);
  }

  /**
   * Log a message at fatal level
   */
  fatal(message: string): void {
    const ctx = this.context ? { context: this.context } : {};
    Logger.sharedPinoLogger!.fatal(ctx, message);
  }

  /**
   * Get the underlying Pino logger instance
   */
  static getPinoLogger(): PinoLogger | undefined {
    return Logger.sharedPinoLogger;
  }
}

// Mark Logger as injectable
Reflect.defineMetadata(INJECTABLE, true, Logger);
