import { Task } from "../../../src/core/task";
import { TestArgs, TestData, TestState } from "../TestStateData";

export class UpdateTask extends Task<TestData, TestArgs> {
  async run(state: TestState): Promise<Partial<TestState> | void> {
    return {
      data: {
        ...state.data,
        name: "updated",
        count: (state.data.count | 0) + 1,
      },
    };
  }
}
