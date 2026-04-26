import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

declare global {
  interface ImportMeta {
    readonly env: Record<string, string | boolean | undefined>;
  }
}

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: z.url(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
