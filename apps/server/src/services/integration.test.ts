import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "@M324/db/schema/auth";
import {
  bet,
  betRelations,
  market,
  marketRelations,
  transaction,
  transactionRelations,
} from "@M324/db/schema/markets";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import { Pool } from "pg";
import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from "testcontainers";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { type AppEnv, requireAdmin } from "../middleware/auth.js";
import { placeBet } from "./bets.js";
import { resolveMarket } from "./markets.js";

const POSTGRES_DATABASE = "m324_test";
const POSTGRES_PASSWORD = "postgres";
const POSTGRES_USER = "postgres";

const schema = {
  account,
  accountRelations,
  bet,
  betRelations,
  market,
  marketRelations,
  session,
  sessionRelations,
  transaction,
  transactionRelations,
  user,
  userRelations,
  verification,
};

vi.setConfig({
  hookTimeout: 120_000,
  testTimeout: 120_000,
});

let container: StartedTestContainer;
let pool: Pool;
let db: ReturnType<typeof drizzle<typeof schema>>;

describe("market money flows", () => {
  beforeAll(async () => {
    container = await new GenericContainer("postgres:16-alpine")
      .withEnvironment({
        POSTGRES_DB: POSTGRES_DATABASE,
        POSTGRES_PASSWORD,
        POSTGRES_USER,
      })
      .withExposedPorts(5432)
      .withWaitStrategy(
        Wait.forLogMessage("database system is ready to accept connections", 2)
      )
      .start();

    pool = new Pool({
      connectionString: getConnectionString(container),
    });
    db = drizzle(pool, { schema });

    await applyMigrations(pool);
  });

  beforeEach(async () => {
    await pool.query(
      'truncate table "transaction", "bet", "market", "account", "session", "verification", "user" restart identity cascade'
    );
  });

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it("placeBet zieht Credits korrekt ab und schreibt Bet plus Transaction", async () => {
    await seedUsers([
      { credits: 1000, id: "admin-1", role: "admin" },
      { credits: 1000, id: "user-1", role: "user" },
    ]);
    await seedMarket({ id: "market-1" });

    const result = await placeBet(
      db,
      { amount: 250, marketId: "market-1", side: "yes" },
      "user-1"
    );

    const [updatedUser] = await db
      .select({ credits: user.credits })
      .from(user)
      .where(eq(user.id, "user-1"));
    const [createdBet] = await db.select().from(bet);
    const [createdTransaction] = await db.select().from(transaction);

    expect(result).toEqual({ accepted: true, credits: 750 });
    expect(updatedUser?.credits).toBe(750);
    expect(createdBet).toMatchObject({
      amount: 250,
      marketId: "market-1",
      side: "yes",
      userId: "user-1",
    });
    expect(createdTransaction).toMatchObject({
      delta: -250,
      reason: "bet",
      refId: "market-1",
      refType: "market",
      userId: "user-1",
    });
  });

  it("resolve verteilt den Pool pari-mutuel an Gewinner", async () => {
    await seedUsers([
      { credits: 0, id: "admin-1", role: "admin" },
      { credits: 0, id: "winner-1", role: "user" },
      { credits: 0, id: "winner-2", role: "user" },
      { credits: 0, id: "loser-1", role: "user" },
    ]);
    await seedMarket({ id: "market-1" });
    await db.insert(bet).values([
      {
        amount: 100,
        id: "bet-1",
        marketId: "market-1",
        side: "yes",
        userId: "winner-1",
      },
      {
        amount: 300,
        id: "bet-2",
        marketId: "market-1",
        side: "yes",
        userId: "winner-2",
      },
      {
        amount: 600,
        id: "bet-3",
        marketId: "market-1",
        side: "no",
        userId: "loser-1",
      },
    ]);

    const result = await resolveMarket(db, {
      marketId: "market-1",
      outcome: "yes",
    });

    const users = await db
      .select({ credits: user.credits, id: user.id })
      .from(user);
    const payouts = await db
      .select()
      .from(transaction)
      .where(eq(transaction.reason, "payout"));
    const [resolvedMarket] = await db
      .select({ outcome: market.outcome, status: market.status })
      .from(market)
      .where(eq(market.id, "market-1"));

    expect(result).toEqual({
      payouts: 2,
      resolved: true,
      totalPool: 1000,
      winnerPool: 400,
    });
    expect(getCredits(users, "winner-1")).toBe(250);
    expect(getCredits(users, "winner-2")).toBe(750);
    expect(getCredits(users, "loser-1")).toBe(0);
    expect(payouts).toHaveLength(2);
    expect(resolvedMarket).toMatchObject({
      outcome: "yes",
      status: "resolved",
    });
  });

  it("Insufficient Credits wirft 400", async () => {
    await seedUsers([
      { credits: 1000, id: "admin-1", role: "admin" },
      { credits: 100, id: "user-1", role: "user" },
    ]);
    await seedMarket({ id: "market-1" });

    await expect(
      placeBet(db, { amount: 101, marketId: "market-1", side: "yes" }, "user-1")
    ).rejects.toMatchObject({
      status: 400,
    });

    const bets = await db.select().from(bet);
    const transactions = await db.select().from(transaction);

    expect(bets).toHaveLength(0);
    expect(transactions).toHaveLength(0);
  });

  it("Resolve durch Non-Admin liefert 403", async () => {
    const app = new Hono<AppEnv>();
    app.use(async (c, next) => {
      c.set("sessionUser", {
        credits: 1000,
        id: "user-1",
        name: "Regular User",
        role: "user",
      });
      await next();
    });
    app.post("/resolve", requireAdmin, (c) => c.json({ resolved: true }));

    const response = await app.request("/resolve", {
      method: "POST",
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Admin required",
    });
  });
});

async function applyMigrations(pool: Pool) {
  const migrationFiles = [
    "packages/db/src/migrations/0000_brief_timeslip.sql",
    "packages/db/src/migrations/0001_warm_dakota_north.sql",
  ];

  for (const migrationFile of migrationFiles) {
    const sql = readFileSync(join(process.cwd(), migrationFile), "utf8");
    const statements = sql
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await pool.query(statement);
    }
  }
}

async function seedUsers(
  users: Array<{ credits: number; id: string; role: "admin" | "user" }>
) {
  await db.insert(user).values(
    users.map((seedUser) => ({
      credits: seedUser.credits,
      email: `${seedUser.id}@example.test`,
      emailVerified: true,
      id: seedUser.id,
      name: seedUser.id,
      role: seedUser.role,
    }))
  );
}

async function seedMarket({ id }: { id: string }) {
  await db.insert(market).values({
    closesAt: new Date(Date.now() + 60 * 60 * 1000),
    createdBy: "admin-1",
    description: "Integration test market",
    id,
    status: "open",
    title: "Will this test pass?",
  });
}

function getConnectionString(startedContainer: StartedTestContainer) {
  return `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${startedContainer.getHost()}:${startedContainer.getMappedPort(5432)}/${POSTGRES_DATABASE}`;
}

function getCredits(users: Array<{ credits: number; id: string }>, id: string) {
  return users.find((row) => row.id === id)?.credits;
}
