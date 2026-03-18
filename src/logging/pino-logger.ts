import pino from "pino";
import fs from "node:fs";
import path from "node:path";

const LOG_FILENAME = process.env.PINO_LOG_FILENAME || "task-script-app.log";
const LOG_DIR_PATH = process.env.PINO_LOG_DIR_PATH || "/var/log/";
const LOG_LEVEL = process.env.PINO_LOG_LEVEL || "debug";
const LOG_TARGET = process.env.PINO_LOG_TARGET || "pino-pretty";

export class PinoLogger {
  private loggerOptions: pino.LoggerOptions = {};

  constructor(options?: pino.LoggerOptions) {
    this.configure(options);
  }

  configure(options?: pino.LoggerOptions) {
    if (!options) {
      return this.initializeScriptDefaults();
    }
    this.loggerOptions = options;
    return this;
  }

  extend(options: pino.LoggerOptions) {
    this.loggerOptions = { ...this.loggerOptions, ...options };
    return this;
  }

  getLogger(msgPrefix?: string): pino.Logger {
    if (!msgPrefix) {
      return pino(this.loggerOptions);
    }

    if (!msgPrefix.endsWith(" ")) {
      msgPrefix += " ";
    }

    return pino({ ...this.loggerOptions, ...{ msgPrefix } });
  }

  private initializeScriptDefaults() {
    this.loggerOptions = {
      level: LOG_LEVEL,
      transport: {
        target: LOG_TARGET,
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      },
      base: { pid: process.pid },
    };

    if (process.env.NODE_ENV === "production") {
      this.loggerOptions = this.getProdScriptOptions();
    }
    return this;
  }

  private getProdScriptOptions() {
    const destination = path.join(LOG_DIR_PATH, LOG_FILENAME);
    const dirPath = path.dirname(destination);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const transport = {
      target: "pino/file",
      options: {
        destination,
      },
    };

    return {
      ...this.loggerOptions,
      ...{ transport },
    };
  }
}
