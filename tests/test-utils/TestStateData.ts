import { AppState } from "../../dist";

export interface TestData {
  readonly name?: string;
  readonly test?: boolean;
  readonly greet?: string;
  readonly count: number;
  readonly runIds?: Array<string>;
}

export interface TestArgs {
  readonly taskTimeMs?: number;
  readonly verbose?: boolean;
  readonly name?: string;
}

export type TestState = AppState<TestData, TestArgs>;
