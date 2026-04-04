import { expect } from "vitest";
import { Task } from "../../../src/core/task";
import { TestArgs, TestData, TestState } from "../TestStateData";

export class TestTask extends Task<TestData, TestArgs> {
  async run(state: TestState): Promise<Partial<TestState>> {
    expect(state).toBeDefined();
    return { data: { test: true, count: (state.data.count | 0) + 1 } };
  }
}
