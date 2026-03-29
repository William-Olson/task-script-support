import { describe, it, expect, beforeEach } from "vitest";
import { Task } from "../src/core/task";
import { TestArgs, TestData, TestState } from "./test-utils/TestStateData";
import { NoopTask } from "./test-utils/tasks/NoopTask";
import { UpdateTask } from "./test-utils/tasks/UpdateTask";

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
      const testState: TestState = {
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
    const testTask = new UpdateTask();
    const initialState: TestState = {
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
    const noopTask = new NoopTask();
    const testState: TestState = {
      id: "test-id",
      data: { name: "test", count: 5 },
      args: { verbose: false },
    };

    const result = await noopTask.run(testState);
    expect(result).toBeUndefined();
  });
});
