import { CommandService } from "task-script-support";
import { Ex2AppStateData } from "../types/state";
import { CLIArg } from "../types/commander-args";
import { container } from "tsyringe";

// Create a command service instance tied to our models
const command = new CommandService<Ex2AppStateData, CLIArg[]>();

// Configure commander as argument parser & create DI Args entry
command.argsProvider = (...argParams: unknown[]) => {
  const parsedArgs = command.argsProvider_Commander(...argParams);

  container.registerInstance("Args", parsedArgs);

  return parsedArgs;
};

export default command;
