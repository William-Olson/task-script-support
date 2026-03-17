import pino from "pino";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";

const APP_NAME = process.env.APP_NAME || "task-script-app";

export class PinoLogger {
  private prodLogDestination: string;

  constructor() {
    this.prodLogDestination = path.join(
      process.env.LOG_DIR_PATH || "/var/log/",
      `${APP_NAME}.log`,
    );
  }

  getLogger(): pino.Logger {
    const loggerOptions: pino.LoggerOptions = {
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          // levelFirst: true,
          translateTime: "SYS:standard",
        },
      },
      base: {
        pid: process.pid,
        hostname: os.hostname(),
      },
    };

    if (process.env.NODE_ENV === "production") {
      const dirPath = path.dirname(this.prodLogDestination);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      return pino({
        ...loggerOptions,
        ...{
          transport: {
            target: "pino/file",
            options: { destination: this.prodLogDestination },
          },
        },
      });
    }

    return pino(loggerOptions);
  }
}
