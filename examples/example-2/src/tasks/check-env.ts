import chalk from "chalk";
import { autoInjectable } from "tsyringe";
import { CLIArg } from "../types/commander-args";
import { Ex2AppState, Ex2AppStateData } from "../types/state";
import { Task } from "task-script-support";
import { ArgService } from "../services/arg-service";

@autoInjectable()
export default class CheckEnv extends Task<Ex2AppStateData, CLIArg[]> {
  declare state: Ex2AppState;

  constructor(private argService: ArgService) {
    super();
  }

  async run() {
    let envState: Partial<Ex2AppState> = {
      data: { environmentValidated: false },
    };

    if (!this.argService.hasFlag("env")) {
      console.debug(chalk.dim("Skipping env check, no env arg provided"));
      return envState;
    }

    console.info(chalk.blueBright("Running Check Environment"));

    // TODO validate env

    envState = { data: { environmentValidated: true } };
    console.debug("CheckEnv Done");
    return envState;
  }
}
