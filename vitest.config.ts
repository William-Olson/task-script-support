const { defineConfig, configDefaults } = require("vitest/config");

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: "./tests/setup.ts",
    exclude: [...configDefaults.exclude],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
