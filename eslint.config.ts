import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    files: ["./src/**/*.ts", "./tests/**/*.ts"],
  },
  globalIgnores(["dist/*"]),
]);
