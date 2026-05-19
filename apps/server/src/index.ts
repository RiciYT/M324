import { createDb } from "@M324/db";
import { user } from "@M324/db/schema/auth";
import { bet, market, transaction } from "@M324/db/schema/markets";
import { desc, eq, ne, sql } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";

import { auth } from "./auth.js";
import { env } from "./env.js";
import { logEvents, writeLog } from "./logging.js";
import {
  type AppEnv,
  createRequireSession,
  requireAdmin,
} from "./middleware/auth.js";
import { getAllowedOrigin, getConfiguredOrigins } from "./origins.js";
import { placeBet } from "./services/bets.js";
import { ServiceError } from "./services/errors.js";
import {
  createMarket,
  getMarketById,
  listMarkets,
  resolveMarket,
} from "./services/markets.js";
import { claimDailyCoins, getWallet } from "./services/wallet.js";

const app = new Hono<AppEnv>();
const db = createDb();
const corsOrigins = getConfiguredOrigins(env.CORS_ORIGIN);
const requireSession = createRequireSession(db);

const createMarketInput = z.object({
  closesAt: z.string().datetime(),
  description: z.string().trim().default(""),
  title: z.string().trim().min(1),
});

const placeBetInput = z.object({
  amount: z.number().int().positive(),
  marketId: z.string().min(1),
  side: z.enum(["yes", "no"]),
});

const resolveMarketInput = z.object({
  marketId: z.string().min(1),
  outcome: z.enum(["yes", "no"]),
});

type MarketSide = "yes" | "no";

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
    origin: (origin) => getAllowedOrigin(origin, corsOrigins),
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

app.get("/api/markets", async (c) => {
  const rows = await listMarkets(db);

  return c.json(rows);
});

app.get("/api/markets/:id", async (c) => {
  const id = c.req.param("id");
  const row = await getMarketById(db, id);

  if (!row) {
    return c.json(null, 404);
  }

  return c.json(row);
});

app.get("/api/markets/:id/activity", async (c) => {
  const id = c.req.param("id");
  const rows = await db
    .select({
      amount: bet.amount,
      createdAt: bet.createdAt,
      id: bet.id,
      side: bet.side,
      userName: user.name,
    })
    .from(bet)
    .innerJoin(user, eq(bet.userId, user.id))
    .where(eq(bet.marketId, id))
    .orderBy(desc(bet.createdAt))
    .limit(20);

  return c.json(
    rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      side: row.side as MarketSide,
    }))
  );
});

app.post("/api/markets", requireSession, async (c) => {
  const input = createMarketInput.parse(await c.req.json());
  const row = await createMarket(db, input, c.var.sessionUser.id);

  return c.json(row, 201);
});

app.get("/api/wallet", requireSession, async (c) => {
  const wallet = await getWallet(db, c.var.sessionUser);

  return c.json(wallet);
});

app.post("/api/wallet/claim", requireSession, async (c) => {
  const wallet = await claimDailyCoins(db, c.var.sessionUser);

  return c.json(wallet);
});

app.get("/api/portfolio", requireSession, async (c) => {
  const positions = await db
    .select({
      amount: sql<number>`coalesce(sum(${bet.amount}), 0)::int`,
      marketId: bet.marketId,
      marketTitle: market.title,
      side: bet.side,
    })
    .from(bet)
    .innerJoin(market, eq(bet.marketId, market.id))
    .where(eq(bet.userId, c.var.sessionUser.id))
    .groupBy(bet.marketId, market.title, bet.side);

  const transactions = await db
    .select({
      amount: transaction.delta,
      createdAt: transaction.createdAt,
      id: transaction.id,
      marketTitle: market.title,
      reason: transaction.reason,
    })
    .from(transaction)
    .leftJoin(market, eq(transaction.refId, market.id))
    .where(eq(transaction.userId, c.var.sessionUser.id))
    .orderBy(desc(transaction.createdAt));

  return c.json({
    positions: positions.map((position) => ({
      ...position,
      side: position.side as MarketSide,
    })),
    transactions: transactions.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      marketTitle: row.marketTitle ?? undefined,
    })),
  });
});

app.get("/api/leaderboard", async (c) => {
  const rows = await db
    .select({
      credits: user.credits,
      name: user.name,
      pnl: sql<number>`(${user.credits} - 1000)::int`,
      rank: sql<number>`row_number() over (order by ${user.credits} desc)::int`,
    })
    .from(user)
    .where(ne(user.role, "system"))
    .orderBy(desc(user.credits))
    .limit(50);

  return c.json(rows);
});

app.post("/api/bets", requireSession, async (c) => {
  const input = placeBetInput.parse(await c.req.json());
  const result = await placeBet(db, input, c.var.sessionUser.id);

  return c.json(result);
});

app.post(
  "/api/markets/:id/resolve",
  requireSession,
  requireAdmin,
  async (c) => {
    const input = resolveMarketInput.parse({
      ...(await c.req.json()),
      marketId: c.req.param("id"),
    });
    const result = await resolveMarket(db, input);

    return c.json(result);
  }
);

app.onError((error, c) => {
  writeLog("error", logEvents.requestFailed, "Request failed", {
    errorMessage: error.message,
    method: c.req.method,
    path: c.req.path,
  });

  if (error instanceof ServiceError) {
    return c.json({ error: error.message }, error.status);
  }

  if (error instanceof z.ZodError) {
    return c.json({ error: "Invalid request", issues: error.issues }, 400);
  }

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
