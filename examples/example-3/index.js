import { CommandService, PinoLogger, Task } from "task-script-support";

const command = new CommandService();

class SetTestMode extends Task {
  run = ({ args }) => ({
    data: {
      isTestMode: new Set(args).has("-t"),
    },
  });
}

class PrintDate extends Task {
  logger = new PinoLogger().getLogger();
  run() {
    const date = new Date();
    const logPrefix = this.state.data.isTestMode ? "Test " : "";
    const fieldName = this.state.data.isTestMode ? "testDate" : "date";

    this.logger.info(`${logPrefix}Date: ${date.toLocaleDateString()}`);
    return { data: { [fieldName]: date } };
  }
}

class PrintState extends Task {
  logger = new PinoLogger().getLogger();
  run(state) {
    this.logger.info({ state }, "State:");
  }
}

command.fromTasks([SetTestMode, PrintDate, PrintState])(...process.argv);
