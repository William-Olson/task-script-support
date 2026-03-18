## task-script-support

A lightweight library for writing task oriented scripts.

Uses the following:

- [immutable](https://www.npmjs.com/package/immutable) (state management)
- [pino](https://www.npmjs.com/package/pino) (logging)

See the example directory for some examples on usage.

## Getting Started

```
npm i task-script-support

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
