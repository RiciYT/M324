import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const shouldRunIntegrationTests = process.env.RUN_INTEGRATION_TESTS === "true";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./apps/web/src", import.meta.url)),
    },
  },
  test: {
    include: ["**/src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.turbo/**",
      ...(shouldRunIntegrationTests ? [] : ["**/integration.test.ts"]),
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});
