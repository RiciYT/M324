import { auth } from "@M324/auth";
import { env } from "@M324/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/favicon.ico", (c) => c.body(null, 204));
app.get("/", (c) => c.text("OK"));

app.onError((error, c) => {
  console.error(`${c.req.method} ${c.req.path} failed`, error);

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
      console.log(`Server is running on http://localhost:${info.port}`);
    }
  );
}
