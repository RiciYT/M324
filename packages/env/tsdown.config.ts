import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    server: "./src/server.ts",
    web: "./src/web.ts",
  },
  format: "esm",
  outDir: "./dist",
  clean: true,
});
