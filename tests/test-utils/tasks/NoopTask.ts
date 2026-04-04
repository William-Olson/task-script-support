import { expect } from "vitest";
import { Task } from "../../../src/core/task";
import { TestArgs, TestData, TestState } from "../TestStateData";

export class NoopTask extends Task<TestData, TestArgs> {
  run = async (state: TestState) => {
    expect(state).toBeDefined();
  };
}
