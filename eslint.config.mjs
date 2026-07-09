import { baseConfig } from "@ostermann/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["**/node_modules", "**/dist", "**/out"]),
  {
    extends: [baseConfig],
  },
  {
    files: ["**/*"],
    rules: {
      "package-json/require-exports": "off",
      "package-json/no-empty-fields": "off",
    },
  },
]);
