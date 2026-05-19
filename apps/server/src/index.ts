import { createDb } from "@M324/db";
import { user } from "@M324/db/schema/auth";
import { bet, market, transaction } from "@M324/db/schema/markets";
import { randomUUID } from "node:crypto";
import { desc, eq, ne, sql } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";

import { auth } from "./auth.js";
import { env } from "./env.js";
import { logEvents, writeLog } from "./logging.js";

const app = new Hono();
const db = createDb();
const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

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
    origin: (origin) => {
      if (!origin) {
        return corsOrigins[0] ?? "";
      }

      return corsOrigins.includes(origin) ? origin : (corsOrigins[0] ?? "");
    },
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
  const rows = await getMarkets();

  return c.json(rows);
});

app.get("/api/markets/:id", async (c) => {
  const id = c.req.param("id");
  const rows = await getMarkets(id);

  if (rows.length === 0) {
    return c.json(null, 404);
  }

  return c.json(rows[0]);
});

app.post("/api/markets", async (c) => {
  const input = createMarketInput.parse(await c.req.json());
  const sessionUser = await getSessionUser(c);
  const createdBy = sessionUser?.id ?? "system";

  const [row] = await db
    .insert(market)
    .values({
      id: randomUUID(),
      title: input.title,
      description: input.description,
      createdBy,
      status: "open",
      closesAt: new Date(input.closesAt),
    })
    .returning();

  if (!row) {
    throw new Error("Market creation failed");
  }

  return c.json(toApiMarket(row, 0, 0), 201);
});

app.get("/api/wallet", async (c) => {
  const sessionUser = await getSessionUser(c);

  return c.json({
    credits: sessionUser?.credits ?? 0,
  });
});

app.get("/api/portfolio", async (c) => {
  const sessionUser = await getSessionUser(c);

  if (!sessionUser) {
    return c.json({ positions: [], transactions: [] });
  }

  const positions = await db
    .select({
      amount: sql<number>`coalesce(sum(${bet.amount}), 0)::int`,
      marketId: bet.marketId,
      marketTitle: market.title,
      side: bet.side,
    })
    .from(bet)
    .innerJoin(market, eq(bet.marketId, market.id))
    .where(eq(bet.userId, sessionUser.id))
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
    .where(eq(transaction.userId, sessionUser.id))
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

app.post("/api/bets", async (c) => {
  const sessionUser = await getSessionUser(c);
  if (!sessionUser) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const input = placeBetInput.parse(await c.req.json());
  const betId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(bet).values({
      id: betId,
      userId: sessionUser.id,
      marketId: input.marketId,
      side: input.side,
      amount: input.amount,
    });
    await tx.insert(transaction).values({
      id: randomUUID(),
      userId: sessionUser.id,
      delta: -input.amount,
      reason: "bet",
      refType: "market",
      refId: input.marketId,
    });
    await tx
      .update(user)
      .set({ credits: sql`${user.credits} - ${input.amount}` })
      .where(eq(user.id, sessionUser.id));
  });

  return c.json({ accepted: true });
});

app.post("/api/markets/:id/resolve", async (c) => {
  const input = resolveMarketInput.parse({
    ...(await c.req.json()),
    marketId: c.req.param("id"),
  });

  await db
    .update(market)
    .set({
      outcome: input.outcome,
      status: "resolved",
      resolvedAt: new Date(),
    })
    .where(eq(market.id, input.marketId));

  return c.json({ resolved: true });
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

async function getSessionUser(c: Context) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user?.id) {
    return null;
  }

  const [row] = await db
    .select({
      credits: user.credits,
      id: user.id,
      name: user.name,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, session.user.id));

  return row ?? null;
}

async function getMarkets(id?: string) {
  const rows = await db
    .select({
      closesAt: market.closesAt,
      createdBy: market.createdBy,
      description: market.description,
      id: market.id,
      noPool: sql<number>`(
        select coalesce(sum(${bet.amount}), 0)::int
        from ${bet}
        where ${bet.marketId} = ${market.id} and ${bet.side} = 'no'
      )`,
      outcome: market.outcome,
      status: market.status,
      title: market.title,
      yesPool: sql<number>`(
        select coalesce(sum(${bet.amount}), 0)::int
        from ${bet}
        where ${bet.marketId} = ${market.id} and ${bet.side} = 'yes'
      )`,
    })
    .from(market)
    .where(id ? eq(market.id, id) : undefined)
    .orderBy(desc(market.createdAt));

  return rows.map((row) => ({
    ...row,
    closesAt: row.closesAt.toISOString(),
    outcome: row.outcome as MarketSide | undefined,
  }));
}

function toApiMarket(
  row: typeof market.$inferSelect,
  yesPool: number,
  noPool: number
) {
  return {
    closesAt: row.closesAt.toISOString(),
    createdBy: row.createdBy,
    description: row.description,
    id: row.id,
    noPool,
    outcome: row.outcome as MarketSide | undefined,
    status: row.status,
    title: row.title,
    yesPool,
  };
}
