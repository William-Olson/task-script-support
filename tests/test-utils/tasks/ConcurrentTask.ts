import { randomUUID } from "crypto";
import { Task } from "../../../src/core/task";
import { TestArgs, TestData, TestState } from "../TestStateData";

export class ConcurrentTask extends Task<TestData, TestArgs> {
  async run(state: TestState): Promise<Partial<TestState>> {
    expect(state.args.taskTimeMs).toBeDefined();
    expect(state.args.taskTimeMs).toBeGreaterThan(0);

    const runId = `run-id-${randomUUID().slice(0, 8)}`;

    await new Promise((res) => setTimeout(res, state.args.taskTimeMs));
    return { data: { runIds: [runId], count: (state.data.count | 0) + 1 } };
  }
}
