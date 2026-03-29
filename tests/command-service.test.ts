import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { CommandService } from "../src/core/command-service";
import { Task } from "../src/core/task";

import { TestArgs, TestData, TestState } from "./test-utils/TestStateData";
import { ConcurrentTask } from "./test-utils/tasks/ConcurrentTask";
import { TestTask } from "./test-utils/tasks/TestTask";
import { GreetTask } from "./test-utils/tasks/GreetTask";

const getElapsedTimeMs = async (
  fn: () => void | Promise<void>,
): Promise<number> => {
  const startTime = new Date();
  await fn();
  const endTime = new Date();
  const elapsedTime: number = endTime.getTime() - startTime.getTime();
  return elapsedTime;
};

describe("CommandService", () => {
  let commandService: CommandService<TestData, TestArgs>;

  beforeEach(() => {
    commandService = new CommandService<TestData, TestArgs>();
    commandService.argsProvider = (...args: unknown[]): TestArgs =>
      (args as Array<TestArgs>[])[0][0] as TestArgs;
    CommandService.stateHistory = [];
  });

  afterEach(() => {
    CommandService.stateHistory = [];
  });

  describe("updateState", () => {
    it("should create initial state when no previous state exists", () => {
      const newState = commandService.updateState(undefined, {
        data: { name: "test", count: 1 },
      });

      expect(newState.data).toEqual({ name: "test", count: 1 });
    });

    it("should merge data from previous state with new data", () => {
      const previousState: TestState = {
        id: "id",
        data: { name: "previous", count: 5 },
        args: { verbose: true },
      };

      const newState = commandService.updateState(previousState, {
        data: { count: 10 } as Partial<TestData>,
      });

      expect(newState.data).toEqual({ name: "previous", count: 10 });
    });

    it("should add to state history", () => {
      commandService.updateState(undefined, { data: { name: "first" } });
      commandService.updateState(undefined, { data: { name: "second" } });

      expect(CommandService.stateHistory.length).toBe(2);
    });

    it("should freeze the returned state", () => {
      const newState = commandService.updateState(undefined, {
        data: { name: "test" },
      });

      expect(Object.isFrozen(newState)).toBe(true);
    });
  });

  describe("setData", () => {
    it("should update state with new data", () => {
      const currentState: TestState = {
        id: "test-id",
        data: { name: "original", count: 0 },
        args: { verbose: false },
      };

      const newState = commandService.setData(currentState, { count: 5 });

      expect(newState.data.count).toBe(5);
      expect(newState.data.name).toBe("original");
    });
  });

  describe("runTasks", () => {
    it("should run multiple tasks in sequence", async () => {
      await commandService.runTasks([TestTask, TestTask], { verbose: false });
      const resultingState = CommandService.stateHistory.pop() as TestState;

      expect(resultingState.data.count).toBe(2);
    });

    it("should run multiple tasks in array concurrently", async () => {
      const taskTimeMs = 200;

      const elapsedTime = await getElapsedTimeMs(async () => {
        await commandService.runTasks(
          [[ConcurrentTask, ConcurrentTask, ConcurrentTask]],
          {
            verbose: false,
            taskTimeMs,
          },
        );
      });
      expect(elapsedTime).toBeLessThan(taskTimeMs * 2);
    });

    it("should pass args to initial state", async () => {
      await commandService.runTasks([TestTask], { verbose: true });

      const initialHistoryState = CommandService.stateHistory[0] as TestState;
      expect(initialHistoryState.args).toEqual({ verbose: true });
    });

    it("should track state history for each task", async () => {
      await commandService.runTasks([TestTask, TestTask, TestTask], {
        verbose: false,
      });

      expect(CommandService.stateHistory.length).toBe(4);
    });
  });

  describe("fromTasks", () => {
    it("should return a function that runs tasks with provided args", async () => {
      const runCommand = commandService.fromTasks([TestTask]);
      await runCommand({ verbose: true });

      expect(CommandService.stateHistory.length).toBeGreaterThan(0);
    });

    it("should share updated state between tasks", async () => {
      class CheckStateTask extends Task<TestData, TestArgs> {
        declare state: TestState;
        async run(state: TestState) {
          expect(state.data.count).toBe(2);
          expect(state.data.test).toBeTruthy();
          expect(state.data.greet).toBe("Hello tester!");
        }
      }

      const runCommand = commandService.fromTasks([
        TestTask,
        GreetTask,
        CheckStateTask,
      ]);

      await runCommand({ verbose: true, name: "tester" }, {});
      expect(CommandService.stateHistory.length).toBe(3);
    });

    it("should resolve updated state after concurrent tasks", async () => {
      class CheckStateSyncTask extends Task<TestData, TestArgs> {
        declare state: TestState;
        async run(state: TestState) {
          // ensure sync point has merged ids
          expect(state.data.runIds?.length).toBe(2);
        }
      }

      const runCommand = commandService.fromTasks([
        [ConcurrentTask, ConcurrentTask],
        CheckStateSyncTask,
      ]);

      await runCommand({ verbose: true, name: "tester", taskTimeMs: 1 }, {});
      const resultingState = CommandService.stateHistory.pop() as TestState;

      expect(resultingState.data.runIds?.length).toBe(2);
      expect(CommandService.stateHistory.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("argsProvider", () => {
    it("should use default argsProvider", () => {
      commandService = new CommandService<TestData, TestArgs>();
      expect(commandService.argsProvider).toBe(
        commandService.argsProvider_Default,
      );
    });

    it("argsProvider_Default should return first argument", () => {
      const args = { verbose: true };
      const result = commandService.argsProvider_Default(args);

      expect(result).toEqual(args);
    });

    it("argsProvider_Commander should filter out last element", () => {
      const args = [{ verbose: true }, "fast", "<commander-export>"];
      const result = commandService.argsProvider_Commander(args);

      expect(result).toEqual([{ verbose: true }, "fast"]);
    });

    it("argsProvider_Yargs should extract first element from array", () => {
      const args = { verbose: true };
      const result = commandService.argsProvider_Yargs([args]);

      expect(result).toEqual(args);
    });
  });
});
