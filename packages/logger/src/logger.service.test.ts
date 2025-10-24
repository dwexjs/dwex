import { describe, it, expect, beforeEach, vi } from "vitest";
import { Logger } from "./logger.service.js";
import type { LogLevel } from "./logger.types.js";

describe("Logger Service", () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger({
      level: "debug",
      prettyPrint: false,
    });
  });

  it("should create a logger instance", () => {
    expect(logger).toBeInstanceOf(Logger);
  });

  it("should log info messages", () => {
    const pinoLogger = logger.getPinoLogger();
    const spy = vi.spyOn(pinoLogger, "info");

    logger.info("Test message");

    expect(spy).toHaveBeenCalledWith({}, "Test message");
  });

  it("should log with context string", () => {
    const pinoLogger = logger.getPinoLogger();
    const spy = vi.spyOn(pinoLogger, "info");

    logger.info("Test message", "TestService");

    expect(spy).toHaveBeenCalledWith(
      { context: "TestService" },
      "Test message",
    );
  });

  it("should log with context object", () => {
    const pinoLogger = logger.getPinoLogger();
    const spy = vi.spyOn(pinoLogger, "info");

    logger.info("Test message", { context: "TestService", userId: "123" });

    expect(spy).toHaveBeenCalledWith(
      { context: "TestService", userId: "123" },
      "Test message",
    );
  });

  it("should log error messages with Error object", () => {
    const pinoLogger = logger.getPinoLogger();
    const spy = vi.spyOn(pinoLogger, "error");
    const error = new Error("Test error");

    logger.error("Error occurred", error);

    expect(spy).toHaveBeenCalledWith({ err: error }, "Error occurred");
  });

  it("should create child logger with context", () => {
    const childLogger = logger.setContext("ChildService");
    const pinoLogger = childLogger.getPinoLogger();
    const spy = vi.spyOn(pinoLogger, "info");

    childLogger.info("Test message");

    expect(spy).toHaveBeenCalledWith(
      { context: "ChildService" },
      "Test message",
    );
  });

  it("should support all log levels", () => {
    const pinoLogger = logger.getPinoLogger();
    const levels: LogLevel[] = [
      "fatal",
      "error",
      "warn",
      "info",
      "debug",
      "trace",
    ];

    for (const level of levels) {
      const spy = vi.spyOn(pinoLogger, level);
      (logger as any)[level]("Test message");
      expect(spy).toHaveBeenCalled();
    }
  });
});
