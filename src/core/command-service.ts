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
   * History of tasks that were executed.
   */
  private invokedTasks: Task<T, V>[] = [];

  /**
   * Returns a function that takes argument input parameters and
   * executes the provided Task array in sequential order providing
   * arguments and managed state.
   *
   * @param tasks the Task Array to run in sequence
   * @returns
   */
  fromTasks(tasks: (TaskClass<T, V> | TaskClass<T, V>[])[]) {
    return async (...cliArgs: unknown[]) => {
      await this.runTasks(tasks, this.argsProvider(cliArgs));
    };
  }

  /**
   * Initialize Tasks and execute run methods in sequential order awaiting
   * promises and chaining state into consecutive Tasks.
   *
   * @param taskArray the Task Array to run in sequence
   * @param cliArgs the parsed CLI Command arguments
   * @param initialState the optional initial AppState to provide tasks
   */
  async runTasks(
    taskArray: (TaskClass<T, V> | TaskClass<T, V>[])[],
    cliArgs: V,
    initialState?: Readonly<AppState<T, V>>,
  ): Promise<Readonly<AppState<T, V>>> {
    this.invokedTasks = [];

    let appState: Readonly<AppState<T, V>> =
      initialState ||
      ({
        id: `${randomUUID()}`,
        args: cliArgs as V,
        data: {} as T,
      } as const);
    this.updateState(undefined, appState);

    for (const TaskEntry of taskArray) {
      try {
        if (Array.isArray(TaskEntry)) {
          appState = await this.runTasksConcurrently(TaskEntry, appState);
        } else {
          const task: Task<T, V> = new TaskEntry();
          task.state = appState;
          this.invokedTasks.push(task);
          appState = await this.runTaskSequence(task, appState);
        }
      } catch (taskErr) {
        console.error("Unexpected task error: ", taskErr);
        process.exit(1);
      }
    }

    // console.log("History:");
    // console.dir(CommandService.stateHistory);

    return appState;
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
   * Run a collection of tasks concurrently and return updated state.
   *
   * @param TaskClasses the array of Task classes to run concurrently
   * @param appState the current app state to provide to tasks
   * @returns the merged updated state after running tasks
   */
  private async runTasksConcurrently(
    TaskClasses: TaskClass<T, V>[],
    appState: AppState<T, V>,
  ) {
    const tasks: Task<T, V>[] = TaskClasses.map((TC) => new TC());

    tasks.forEach((t) => {
      t.state = appState;
      this.invokedTasks.push(t);
    });

    const results = await Promise.all(
      tasks.map((t) => this.runTaskSequence(t, appState)),
    );

    return results.reduce((p, n) => {
      return this.updateState(p, n);
    }, appState);
  }

  /**
   * Run the task run and hook methods in sequence. Returns updated state.
   *
   * @param task the task to execute the run on
   * @param currentState the app state to provide to the task methods
   * @returns updated app state after
   */
  private async runTaskSequence(
    task: Task<T, V>,
    currentState: AppState<T, V>,
  ): Promise<AppState<T, V>> {
    let appState = currentState;
    appState = await this.invokeTaskMethod(task, appState, "initialize");
    appState = await this.invokeTaskMethod(task, appState, "preRun");
    appState = await this.invokeTaskMethod(task, appState, "run");
    appState = await this.invokeTaskMethod(task, appState, "postRun");
    return appState;
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

    task.state = updatedState;
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
