import { AppState } from "task-script-support";

export interface Ex1Data {
  test: boolean;
}

export interface Ex1Args {
  name: string;
}

export type Ex1State = AppState<Ex1Data, Ex1Args>;
