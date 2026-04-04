import { expect } from "vitest";
import { Task } from "../../../src/core/task";
import { TestArgs, TestData, TestState } from "../TestStateData";

export class GreetTask extends Task<TestData, TestArgs> {
  async run(state: TestState): Promise<void | Partial<TestState>> {
    expect(state.args.name).toBeDefined();
    return {
      data: {
        greet: `Hello ${state.args.name}!`,
        count: (state.data.count | 0) + 1,
      },
    };
  }
}
