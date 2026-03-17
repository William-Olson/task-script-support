import type { AppState } from "./state";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TaskClass<T, V> = new (...injected: any[]) => Task<T, V>;
export type RunMethod<T, V> = (
  state: AppState<T, V>,
) => Promise<Partial<AppState<T, V>> | void>;

export class Task<T, V> {
  state: AppState<T, V> = {
    id: "<uninitialized>",
    data: {} as T,
    args: {} as V,
  };

  async run(state: AppState<T, V>): Promise<Partial<AppState<T, V>> | void> {
    throw new Error(
      `run not implemented in ${this.constructor.name} (${state.id})`,
    );
  }
}
