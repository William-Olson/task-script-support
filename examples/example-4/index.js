import { randomUUID } from "crypto";
import { CommandService, PinoLogger, Task } from "task-script-support";

const command = new CommandService();

class SetTestMode extends Task {
  run = ({ args }) => ({
    data: {
      isTestMode: new Set(args).has("-t"),
    },
  });
}

class SimulateWork extends Task {
  run = async () => {
    const workerName = `worker-${randomUUID().slice(0, 4)}`;
    const randomInt = parseInt(`${Math.random() * 10}`);
    const randomMs = parseInt(`${1000 * randomInt}`);

    this.logger = new PinoLogger().getLogger(workerName);
    this.logger.info(`Selected countdown: ${randomInt}`);

    let waited = 0;
    const loggingInterval = setInterval(() => {
      waited += 1000;
      this.logger.info(`Counting down ${(randomMs - waited) / 1000}s`);
    }, 1000);

    await new Promise((res) => {
      setTimeout(() => {
        clearInterval(loggingInterval);
        res();
      }, randomMs);
    });
    return {
      data: {
        [workerName]: `Ran for ${randomMs}`,
      },
    };
  };
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

command.fromTasks([
  SetTestMode,
  [
    SimulateWork,
    SimulateWork,
    SimulateWork, // TaskClass Array's run concurrently
    SimulateWork,
    SimulateWork,
    SimulateWork,
  ],
  PrintDate, // Create sync points or continue with sequential flow
  PrintState,
])(...process.argv);
