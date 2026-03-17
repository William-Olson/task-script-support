import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CommandService } from "../src/core/command-service";
import { Task } from "../src/core/task";
import type { AppState } from "../src/core/state";

interface TestData {
  name: string;
  count: number;
}

interface TestArgs {
  verbose: boolean;
}

describe("CommandService", () => {
  let commandService: CommandService<TestData, TestArgs>;

  beforeEach(() => {
    commandService = new CommandService<TestData, TestArgs>();
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
      const previousState: AppState<TestData, TestArgs> = {
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
      const currentState: AppState<TestData, TestArgs> = {
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
      let runCount = 0;

      class Task1 extends Task<TestData, TestArgs> {
        async run(
          state: AppState<TestData, TestArgs>,
        ): Promise<Partial<AppState<TestData, TestArgs>>> {
          runCount++;
          return { data: { ...state.data, count: 1 } };
        }
      }

      class Task2 extends Task<TestData, TestArgs> {
        async run(
          state: AppState<TestData, TestArgs>,
        ): Promise<Partial<AppState<TestData, TestArgs>>> {
          runCount++;
          return { data: { ...state.data, count: state.data.count + 1 } };
        }
      }

      await commandService.runTasks([Task1, Task2], { verbose: false });

      expect(runCount).toBe(2);
    });

    it("should pass args to initial state", async () => {
      class TestTask extends Task<TestData, TestArgs> {
        async run(): Promise<Partial<AppState<TestData, TestArgs>>> {
          return {};
        }
      }

      await commandService.runTasks([TestTask], { verbose: true });

      const initialHistoryState = CommandService.stateHistory[0] as AppState<
        TestData,
        TestArgs
      >;
      expect(initialHistoryState.args).toEqual({ verbose: true });
    });

    it("should track state history for each task", async () => {
      class TestTask extends Task<TestData, TestArgs> {
        async run(
          state: AppState<TestData, TestArgs>,
        ): Promise<Partial<AppState<TestData, TestArgs>>> {
          return {
            data: { name: state.data.name, count: state.data.count + 1 },
          };
        }
      }

      await commandService.runTasks([TestTask, TestTask, TestTask], {
        verbose: false,
      });

      expect(CommandService.stateHistory.length).toBe(4);
    });
  });

  describe("fromTasks", () => {
    it("should return a function that runs tasks with provided args", async () => {
      class TestTask extends Task<TestData, TestArgs> {
        async run(
          state: AppState<TestData, TestArgs>,
        ): Promise<Partial<AppState<TestData, TestArgs>>> {
          expect(state).toBeDefined();
          return { data: { name: "executed", count: 1 } };
        }
      }

      const runCommand = commandService.fromTasks([TestTask]);
      await runCommand({ verbose: true });

      expect(CommandService.stateHistory.length).toBeGreaterThan(0);
    });
  });

  describe("argsProvider", () => {
    it("should use default argsProvider", () => {
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
