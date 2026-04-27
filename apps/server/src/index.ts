import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { auth } from "./auth.js";
import { env } from "./env.js";
import { logEvents, writeLog } from "./logging.js";

const app = new Hono();

writeLog("info", logEvents.environmentLoaded, "Server environment loaded", {
  nodeEnv: env.NODE_ENV,
  vercel: Boolean(process.env.VERCEL),
});
writeLog("info", logEvents.databaseConfigured, "Database URL configured", {
  hasDatabaseUrl: Boolean(env.DATABASE_URL),
});
writeLog("info", logEvents.corsConfigured, "CORS origin configured", {
  origin: env.CORS_ORIGIN,
});

app.use(logger());
app.use("*", async (c, next) => {
  writeLog("info", logEvents.requestStarted, "Request started", {
    method: c.req.method,
    path: c.req.path,
  });

  await next();

  writeLog("info", logEvents.requestCompleted, "Request completed", {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
  });
});
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  writeLog("info", logEvents.authRequestReceived, "Auth request received", {
    method: c.req.method,
    path: c.req.path,
  });

  return auth.handler(c.req.raw);
});

const ignoreFaviconRequest = (c: Context) => {
  writeLog("info", logEvents.faviconIgnored, "Favicon request ignored");

  return c.body(null, 204);
};

app.get("/favicon.ico", ignoreFaviconRequest);
app.get("/favicon.png", ignoreFaviconRequest);
app.get("/", (c) => {
  writeLog("info", logEvents.healthcheckRequested, "Healthcheck requested");

  return c.text("OK");
});

app.onError((error, c) => {
  writeLog("error", logEvents.requestFailed, "Request failed", {
    errorMessage: error.message,
    method: c.req.method,
    path: c.req.path,
  });

  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;

if (!process.env.VERCEL) {
  const { serve } = await import("@hono/node-server");

  serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      writeLog("info", logEvents.serverListening, "Server is listening", {
        port: info.port,
        url: `http://localhost:${info.port}`,
      });
    }
  );
}
