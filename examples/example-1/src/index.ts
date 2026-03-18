import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { CommandService } from "task-script-support";

import { GreetTask } from "./tasks/greet-task";
import { Ex1Args, Ex1Data } from "./types/state";
import { LogState } from "./tasks/log-state";

// initialize the command service
const commandService = new CommandService<Ex1Data, Ex1Args>();
commandService.argsProvider = commandService.argsProvider_Yargs;

const argv = yargs(hideBin(process.argv))
  .command(
    "hello [name]",
    "welcome user",
    (yargs) => {
      yargs.positional("name", { default: "User" });
    },
    commandService.fromTasks([GreetTask, LogState]),
  )
  .option("v", { alias: "verbose", type: "boolean" })
  .help()
  .parse();
