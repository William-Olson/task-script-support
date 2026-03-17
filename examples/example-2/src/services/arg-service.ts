import { inject, singleton } from "tsyringe";
import { CLIArg, ArgObject } from "../types/commander-args";

@singleton()
export class ArgService {
  constructor(@inject("Args") private args?: CLIArg[]) {}

  getOption<T = string>(longNameOption: string): T {
    if (!this.args) {
      throw new Error("Missing Arguments in ArgService!");
    }

    const argObjects: ArgObject[] = [];
    for (const a of this.args) {
      if (Array.isArray(a) || typeof a === "string") continue;
      argObjects.push(a);
    }

    const found = argObjects.find(
      (arg: ArgObject) => arg[longNameOption] !== undefined,
    );
    if (found) {
      return found[longNameOption] as T;
    } else {
      throw new Error(`Unable to resolve argument option ${longNameOption}`);
    }
  }

  hasFlag(flag: string) {
    if (!this.args) {
      throw new Error("Missing Arguments in ArgService!");
    }
    return this.args.find((arg) => {
      if (typeof arg === "string") return false;
      if (Array.isArray(arg)) return false;
      return arg[flag] !== undefined;
    });
  }
}
