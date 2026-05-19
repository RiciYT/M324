import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: z.url(),
    VITE_GRAFANA_URL: z.url().optional(),
  },
  runtimeEnv: {
    VITE_SERVER_URL:
      import.meta.env.VITE_SERVER_URL ??
      (import.meta.env.DEV ? "http://localhost:3000" : undefined),
    VITE_GRAFANA_URL:
      import.meta.env.VITE_GRAFANA_URL ??
      (import.meta.env.DEV
        ? "http://localhost:3001/d/m324-observability?orgId=1&kiosk=tv&refresh=30s"
        : undefined),
  },
  emptyStringAsUndefined: true,
});
