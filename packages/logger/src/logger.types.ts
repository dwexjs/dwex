import type { LoggerOptions as PinoLoggerOptions } from "pino";

/**
 * Injection token for the Logger service
 */
export const LOGGER_TOKEN = "LOGGER";

/**
 * Log levels supported by the logger
 */
export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /**
   * Minimum log level to output
   * @default 'info'
   */
  level?: LogLevel;

  /**
   * Enable colorful output in console
   * @default true in development, false in production
   */
  colorize?: boolean;

  /**
   * Enable pretty printing (human-readable format)
   * @default true in development, false in production
   */
  prettyPrint?: boolean;

  /**
   * File path to write logs to (optional)
   * If not provided, logs only to console
   */
  filePath?: string;

  /**
   * Additional Pino logger options
   */
  pinoOptions?: Omit<PinoLoggerOptions, "level">;
}

/**
 * Logger context for tracking the source of logs
 */
export interface LoggerContext {
  /**
   * Service or controller name
   */
  context?: string;

  /**
   * Additional metadata
   */
  [key: string]: unknown;
}
