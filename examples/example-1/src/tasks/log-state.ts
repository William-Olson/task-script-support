import { Task } from "task-script-support";
import { Ex1Args, Ex1Data, Ex1State } from "../types/state";

export class LogState extends Task<Ex1Data, Ex1Args> {
  declare state: Ex1State;

  async run(state: Ex1State) {
    console.dir(state);
  }
}
