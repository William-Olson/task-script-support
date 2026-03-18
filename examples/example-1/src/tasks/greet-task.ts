import { Task } from "task-script-support";
import { Ex1Args, Ex1Data, Ex1State } from "../types/state";

export class GreetTask extends Task<Ex1Data, Ex1Args> {
  declare state: Ex1State;

  async run(state: Ex1State): Promise<void | Partial<Ex1State>> {
    if (!state?.args?.name) {
      return;
    }

    console.log(`Hello ${state.args.name}!`);

    // return new data to merge it with the state object
    return { data: { test: true } };
  }
}
