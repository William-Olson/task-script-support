### Basic Usage

This library helps you write task-based scripts and cli apps where you define a series of tasks that run in sequence, each receiving and optionally updating shared state.

```bash
npm i task-script-support
```

_Note: see the [examples](./examples/example-3/index.js) directory for an example in JavaScript._

#### 1. Define the data and args types

```typescript
import { AppState } from "task-script-support";

export interface MyData {
  // App data goes here
  result?: string;
}

export interface MyArgs {
  // CLI arguments
  name?: string;
  verbose?: boolean;
}

export type MyState = AppState<MyData, MyArgs>;
```

#### 2. Create tasks that extend the Task class

```typescript
import { Task } from "task-script-support";
import { MyData, MyArgs, MyState } from "./types";

export class GreetTask extends Task<MyData, MyArgs> {
  async run(state: MyState): Promise<void | Partial<MyState>> {
    const name = state.args.name || "World";
    console.log(`Hello ${name}!`);

    // Return partial state to merge with existing state
    return { data: { result: `Greeted ${name}` } };
  }
}

export class LogTask extends Task<MyData, MyArgs> {
  async run(state: MyState): Promise<void | Partial<MyState>> {
    console.log("Final state:", state);
  }
}
```

#### 3. Set up the command service with your tasks

```typescript
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { CommandService } from "task-script-support";

import { GreetTask, LogTask } from "./tasks";
import { MyData, MyArgs } from "./types";

const commandService = new CommandService<MyData, MyArgs>();

// Configure the args provider for yargs
commandService.argsProvider = commandService.argsProvider_Yargs;

const argv = yargs(hideBin(process.argv))
  .command(
    "greet [name]",
    "Greet a user",
    (yargs) => {
      yargs.positional("name", { default: "User" });
    },
    commandService.fromTasks([GreetTask, LogTask]),
  )
  .option("v", { alias: "verbose", type: "boolean" })
  .help()
  .parse();
```

### Key Concepts

- **Task**: Extend the `Task` class to create reusable task units
- **run()**: Each task implements a `run` method that receives the current state and optionally returns partial state updates
- **CommandService**: Orchestrates running tasks in sequence, manages state history, and configures argument providers
- **State merging**: Return `Partial<AppState>` from the task's run method to merge updates into the shared state

### Using with Commander

```typescript
import commander from "commander";
import { CommandService } from "task-script-support";
import { Task1, Task2, Task3 } from "./tasks";

const commandService = new CommandService<MyData, MyArgs>();

// Configure args provider for commander
commandService.argsProvider = commandService.argsProvider_Commander;

const { program } = commander;

program
  .command("mycommand")
  .option("-d, --debug", "enable debug mode")
  .action(commandService.fromTasks([Task1, Task2, Task3]));

program.parse(process.argv);
```

### Logging

The library includes built-in logging support via pino:

```typescript
import { PinoLogger } from "task-script-support";

const pinoLogger = new PinoLogger(/* options */).getLogger();

pinoLogger.info("Starting task...");
pinoLogger.error(new Error("Something went wrong"), "Task failed");
```

## Development

Quickstart

```bash
# install dependencies
npm i

# set up the git hooks to format on commit
npm run hooks-one-time-setup

# build the project
npm run build

# run the example
cd ./examples/example-1
npm i
npm start
```

### Environment Setup

Use the following for development:

```
PINO_LOG_LEVEL=debug
NODE_ENV=development
```

### Building the project

To build the project, run:

```bash
npm run build
```

This will compile the TypeScript code and output it to the `dist` directory.

### Linting

To lint the code, run:

```bash
npm run lint
```

### Formatting

To format the code using Prettier, run:

```bash
npm run format
```

or automatically run formatting on file changes:

```bash
npm run prettier-watch
```

### Clean

To clean up the project (delete dist folder):

```bash
npm run clean
```

### Test

Run the tests:

```
npm run test
```

or automatically run them on file changes:

```
npm run test-watch
```

Additional Links:

- [eslint](https://www.npmjs.com/package/eslint) (code linting)
- [prettier](https://www.npmjs.com/package/prettier) (code formatting)
- [vitest](https://www.npmjs.com/package/vitest) (testing)
