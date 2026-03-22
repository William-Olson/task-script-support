import { randomUUID } from "node:crypto";
import { AppState } from "./state";
import { Task, TaskClass } from "./task";
import { mergeDeep } from "immutable";

/**
 * CommandService
 *
 * Handles running Task classes in sequence and provides
 * state to be shared between them.
 */
export class CommandService<T, V> {
  /**
   * History array for tracking changes in app state. Since state is immutable,
   * each call to update will trigger a new change entry.
   */
  static stateHistory: unknown[] = [];

  /**
   * Returns a function that takes argument input parameters and
   * executes the provided Task array in sequential order providing
   * arguments and managed state.
   *
   * @param tasks the Task Array to run in sequence
   * @returns
   */
  fromTasks(tasks: TaskClass<T, V>[]) {
    return async (...cliArgs: unknown[]) => {
      return await this.runTasks(tasks, this.argsProvider(cliArgs));
    };
  }

  /**
   * Initialize Tasks and execute run methods in sequential order awaiting
   * promises and chaining state into consecutive Tasks.
   *
   * @param taskArray the Task Array to run in sequence
   * @param cliArgs
   */
  async runTasks(taskArray: TaskClass<T, V>[], cliArgs: V) {
    const invokedTasks: Task<T, V>[] = [];

    let appState: Readonly<AppState<T, V>> = {
      id: `${randomUUID()}`,
      args: cliArgs as V,
      data: {} as T,
    } as const;
    this.updateState(undefined, appState);

    for (const TaskClazz of taskArray) {
      const task: Task<T, V> = new TaskClazz();
      task.state = appState;
      try {
        invokedTasks.push(task);
        appState = await this.invokeTaskMethod(task, appState, "initialize");
        appState = await this.invokeTaskMethod(task, appState, "preRun");
        appState = await this.invokeTaskMethod(task, appState, "run");
        appState = await this.invokeTaskMethod(task, appState, "postRun");
      } catch (taskErr) {
        console.error("Unexpected task error: ", taskErr);
        process.exit(1);
      }
    }

    // console.log("History:");
    // console.dir(CommandService.stateHistory);
  }

  /**
   * Update the state object with partial state data. Returns state as a
   * frozen object.
   *
   * @param state current or previous state (should be complete object).
   * @param overrides updated partial state to merge into current state.
   * @returns the merged and updated state object.
   */
  updateState(
    state?: AppState<T, V>,
    overrides: Partial<AppState<Partial<T>, Partial<V>>> = {},
  ) {
    const assignFlow: Partial<AppState<Partial<T>, Partial<V>>>[] = [
      state || {},
      overrides,
    ];

    const latestState = Object.freeze(
      Object.assign({}, ...assignFlow, {
        data: mergeDeep(
          {},
          ...(assignFlow.map((e) => e.data || {}) as Partial<T>[]),
        ),
      }) as AppState<T, V>,
    );

    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      CommandService.stateHistory.push(latestState);
    }
    return latestState;
  }

  /**
   * Invoke a state changing method of a task. Returns updated state.
   *
   * @param task the task to invoke the method on.
   * @param appState the current state to provide to the task method.
   * @param methodName the name of the task method to call.
   * @returns updated state.
   */
  private async invokeTaskMethod(
    task: Task<T, V>,
    appState: AppState<T, V>,
    methodName: keyof Task<T, V>,
  ) {
    let updatedState = appState;
    if (!task[methodName] || typeof task[methodName] !== "function") {
      return updatedState;
    }
    const returnedState = await task[methodName](appState);
    if (returnedState) {
      updatedState = this.updateState(task.state, returnedState);
    } else {
      updatedState = task.state;
    }

    return updatedState;
  }

  /**
   * Update state data only.
   *
   * @param state current or previous state
   * @param data updated state data partial
   * @returns merged and updated state
   */
  setData = (state: AppState<T, V>, data: Partial<T>) =>
    this.updateState(state, { data });

  /**
   * Helper for parsing arguments using the yargs library.
   *
   * @param cliArgs Yargs callback params.
   * @returns args as parsed by yargs.
   */
  argsProvider_Yargs = (...cliArgs: unknown[]) => {
    return (cliArgs[0] as Array<V>)[0] as V;
  };

  /**
   * Helper for parsing aguments via commander.js library.
   *
   * @param cliArgs Commander arguments parameters.
   * @returns commander parsed arg array.
   */
  argsProvider_Commander = (...cliArgs: unknown[]) => {
    if (cliArgs.length === 1) {
      cliArgs = cliArgs[0] as unknown[];
    }

    if (cliArgs.length) {
      // remove last entry as it's the commander default export
      cliArgs.pop();
    }
    return cliArgs as unknown as V;
  };

  /**
   * Default provider for argument parsing.
   *
   * @param cliArgs arg callback parameters.
   * @returns the first param given as is.
   */
  argsProvider_Default = (...cliArgs: unknown[]) => {
    return cliArgs[0] as V;
  };

  /**
   * Set this property to override the arguments parsing provider.
   * This is also a good way of tapping into the parsed args if you
   * need a hook to access them for dependency injection etc.
   */
  argsProvider = this.argsProvider_Default;
}
