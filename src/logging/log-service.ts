import { PinoLogger } from "./pino-logger";
import pino from "pino";

export class LogService {
  logger: pino.Logger;

  constructor(pinoLogger: PinoLogger) {
    this.logger = pinoLogger.getLogger();
  }

  public info(msg: string, obj?: unknown): void {
    this.logger.info(obj, msg);
  }

  public error(err: Error | string, msg?: string, obj?: unknown): void {
    if (err instanceof Error) {
      this.logger.error({ err, ...(obj ? obj : {}) }, msg || "Error occurred");
    } else {
      this.logger.error(obj, `${msg}: ${err}`);
    }
  }

  public warn(msg: string, obj?: unknown): void {
    this.logger.warn(obj, msg);
  }

  public debug(msg: string, obj?: unknown): void {
    this.logger.debug(obj, msg);
  }
}
