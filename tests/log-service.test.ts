import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogService } from "../src/logging/log-service";
import { PinoLogger } from "../src/logging/pino-logger";

vi.mock("pino", () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

describe("LogService", () => {
  let logService: LogService;

  beforeEach(() => {
    const pinoLogger = new PinoLogger();
    logService = new LogService(pinoLogger);
  });

  describe("info", () => {
    it("should log info message", () => {
      const logger = logService.logger as unknown as {
        info: ReturnType<typeof vi.fn>;
      };
      logService.info("Test message");

      expect(logger.info).toHaveBeenCalledWith(undefined, "Test message");
    });

    it("should log info message with object", () => {
      const logger = logService.logger as unknown as {
        info: ReturnType<typeof vi.fn>;
      };
      const obj = { key: "value" };
      logService.info("Test message", obj);

      expect(logger.info).toHaveBeenCalledWith(obj, "Test message");
    });
  });

  describe("error", () => {
    it("should log error with Error object", () => {
      const logger = logService.logger as unknown as {
        error: ReturnType<typeof vi.fn>;
      };
      const error = new Error("Test error");
      logService.error(error, "Error occurred");

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ err: error }),
        "Error occurred",
      );
    });

    it("should log error with string", () => {
      const logger = logService.logger as unknown as {
        error: ReturnType<typeof vi.fn>;
      };
      logService.error("Error string", "Custom message");

      expect(logger.error).toHaveBeenCalledWith(
        undefined,
        "Custom message: Error string",
      );
    });
  });

  describe("warn", () => {
    it("should log warning message", () => {
      const logger = logService.logger as unknown as {
        warn: ReturnType<typeof vi.fn>;
      };
      logService.warn("Warning message");

      expect(logger.warn).toHaveBeenCalledWith(undefined, "Warning message");
    });
  });

  describe("debug", () => {
    it("should log debug message", () => {
      const logger = logService.logger as unknown as {
        debug: ReturnType<typeof vi.fn>;
      };
      logService.debug("Debug message");

      expect(logger.debug).toHaveBeenCalledWith(undefined, "Debug message");
    });
  });
});

describe("PinoLogger", () => {
  let pinoLogger: PinoLogger;

  beforeEach(() => {
    pinoLogger = new PinoLogger();
  });

  it("should create a logger instance", () => {
    const logger = pinoLogger.getLogger();

    expect(logger).toBeDefined();
  });

  it("should use default log level from environment", () => {
    const originalLogLevel = process.env.LOG_LEVEL;
    delete process.env.LOG_LEVEL;

    const logger = pinoLogger.getLogger();
    expect(logger).toBeDefined();

    process.env.LOG_LEVEL = originalLogLevel;
  });
});
