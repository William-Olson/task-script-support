import { CLIArg } from "./commander-args";
import { AppState } from "libdev";

export interface Ex2AppStateData {
  readonly errorMessages?: string[];
  readonly banner?: {
    readonly status?: "success" | "failed";
    readonly font?: string;
  };
  readonly environmentValidated?: boolean;
}

export type Ex2AppState = AppState<Ex2AppStateData, CLIArg[]>;
