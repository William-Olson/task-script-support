export interface AppState<T, V> {
  readonly id: string;

  // Add app data here as needed. Use readonly for immutable fields.
  //
  // Note: this object gets passed to deepMerge upon updating app state
  // which also merges array fields. This might be fine or you might want
  // to make your arrays <type>[] | undefined to allow clobbering.
  readonly data: T;
  readonly args: V;
}
