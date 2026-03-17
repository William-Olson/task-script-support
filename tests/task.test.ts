import { describe, it, expect, beforeEach } from "vitest";
import { Task } from "../src/core/task";
import type { AppState } from "../src/types/state";

interface TestData {
  name: string;
  count: number;
}

interface TestArgs {
  verbose: boolean;
}

describe("Task", () => {
  let task: Task<TestData, TestArgs>;

  beforeEach(() => {
    task = new Task<TestData, TestArgs>();
  });

  describe("constructor", () => {
    it("should initialize with default state", () => {
      expect(task.state.id).toBe("<uninitialized>");
      expect(task.state.data).toEqual({});
      expect(task.state.args).toEqual({});
    });
  });

  describe("run", () => {
    it("should throw an error when run is not implemented", async () => {
      const testState: AppState<TestData, TestArgs> = {
        id: "test-id",
        data: { name: "test", count: 1 },
        args: { verbose: true },
      };

      await expect(task.run(testState)).rejects.toThrow(
        "run not implemented in Task (test-id)",
      );
    });
  });
});

describe("Task with implementation", () => {
  it("should allow subclasses to implement run", async () => {
    class TestTask extends Task<TestData, TestArgs> {
      async run(
        state: AppState<TestData, TestArgs>,
      ): Promise<Partial<AppState<TestData, TestArgs>> | void> {
        return {
          data: {
            ...state.data,
            name: "updated",
            count: state.data.count + 1,
          },
        };
      }
    }

    const testTask = new TestTask();
    const initialState: AppState<TestData, TestArgs> = {
      id: "test-id",
      data: { name: "original", count: 0 },
      args: { verbose: false },
    };

    const result = await testTask.run(initialState);

    expect(result).toEqual({
      data: { name: "updated", count: 1 },
    });
  });

  it("should allow run to return void", async () => {
    class NoopTask extends Task<TestData, TestArgs> {
      async run(
        _state: AppState<TestData, TestArgs>,
      ): Promise<Partial<AppState<TestData, TestArgs>> | void> {
        expect(_state).toBeDefined();
        return undefined;
      }
    }

    const noopTask = new NoopTask();
    const testState: AppState<TestData, TestArgs> = {
      id: "test-id",
      data: { name: "test", count: 5 },
      args: { verbose: false },
    };

    const result = await noopTask.run(testState);
    expect(result).toBeUndefined();
  });
});
