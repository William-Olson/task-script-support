## task-script-support

A lightweight library for writing task oriented scripts.

Uses the following:

- [immutable](https://www.npmjs.com/package/immutable) (state management)
- [pino](https://www.npmjs.com/package/pino) (logging)

<sub>(Note: using the cli tool to generate a new project will install many additional npm packages including [tsyringe](https://github.com/microsoft/tsyringe/issues), [figlet](https://github.com/patorjk/figlet.js), [yargs](https://github.com/yargs/yargs), [chalk](https://github.com/chalk/chalk), [dotenv](https://github.com/motdotla/dotenv) and more)</sub>

For using the library directly, see [usage.md](./usage.md). The following section demonstrates using the `tssc` tool to generate and update a new project from a template.

## Getting Started

Install the `tssc` cli tool:

```bash
npm i -g task-script-support-cli
```

Verify installation / check version:

```bash
tssc -v
```

## Introduction

📂 **New Project**

Create a new project with the `new` command.

```bash
tssc new -n "my-awesome-project"

cd ./my-awesome-project && npm i && npm start -- --help

# My Awesome Project CLI Client
#
# Commands:
#   index.ts verify  check the app is working
#
# Options:
#       --version  Show version number                                   [boolean]
#   -d, --debug    enable extra logging                 [boolean] [default: false]
#       --help     Show help                                             [boolean]
```

⚡ **Resource Generation**

Use the `gen` command to generate new `task`, `service`, or `command` class.

For example we can generate a new greet task to say hello.

```bash
tssc gen --task -n "greet"
```

Modify the new task to log a message. You can reference the cli args in the task classes.

![edit1](./assets/task-into-example.png)

If we add a new cli arg we modify the `CLIArgs` type to reflect that option.

```bash
code ./src/types/state.ts
```

![edit2](./assets/cli-arg-edit.png)

🔌 **Create Command**

When a command is generated it prompts for the tasks the command will execute.

```bash
tssc gen --command -n "hello command"

# select the greet task, optionally including others and order them as needed
```

<sub>(Note: ordered tasks are exectued sequentially but you can wrap them in square brackets `[]` for concurrent execution. Mix and match to create sync points and advanced workflows)</sub>

We can register the new command in our `./src/index.ts` file by adding the import and command to yargs:

```typescript
// ...

import { HelloCommand } from "./commands/hello-command";

  // ...

  .command(
    "hello",
    "greet the user",
    (yargs) => {
      yargs.option("n", {
        alias: "name",
        type: "string",
        describe: "the name of the user to greet",
      });
    },
    container.resolve(HelloCommand).handler,
  )
```

and run it to test things out.

```bash
npm start -- hello -n "Max Headroom"
# outputs:
# Hello, Max Headroom! Welcome to the app!
```
