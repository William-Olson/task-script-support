export interface ArgObject {
  readonly [name: string]: string | boolean | number;
}

export type CLIArg = string | string[] | ArgObject;
