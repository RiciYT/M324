import type { createDb } from "@M324/db";
import { user } from "@M324/db/schema/auth";
import { bet, market, transaction } from "@M324/db/schema/markets";
import { randomUUID } from "node:crypto";
import { desc, eq, sql } from "drizzle-orm";

import { ServiceError } from "./errors.js";

type Database = ReturnType<typeof createDb>;
type MarketSide = "yes" | "no";

interface CreateMarketInput {
  closesAt: string;
  description: string;
  title: string;
}

interface ResolveMarketInput {
  marketId: string;
  outcome: MarketSide;
}

interface WinningBet {
  amount: number;
  id: string;
  userId: string;
}

export async function listMarkets(db: Database) {
  return await getMarkets(db);
}

export async function getMarketById(db: Database, id: string) {
  const rows = await getMarkets(db, id);

  return rows[0];
}

export async function createMarket(
  db: Database,
  input: CreateMarketInput,
  createdBy: string
) {
  const serverNow = new Date();
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

  return toApiMarket(row, 0, 0, serverNow);
}

export async function resolveMarket(db: Database, input: ResolveMarketInput) {
  return await db.transaction(async (tx) => {
    const [selectedMarket] = await tx
      .select({
        id: market.id,
        status: market.status,
      })
      .from(market)
      .where(eq(market.id, input.marketId))
      .limit(1);

    if (!selectedMarket) {
      throw new ServiceError(404, "Market not found");
    }

    if (selectedMarket.status !== "open") {
      throw new ServiceError(409, "Market is already resolved");
    }

    const marketBets = await tx
      .select({
        amount: bet.amount,
        id: bet.id,
        side: bet.side,
        userId: bet.userId,
      })
      .from(bet)
      .where(eq(bet.marketId, input.marketId));

    const totalPool = marketBets.reduce((sum, row) => sum + row.amount, 0);
    const winningBets = marketBets
      .filter((row) => row.side === input.outcome)
      .map(({ amount, id, userId }) => ({ amount, id, userId }));
    const winnerPool = winningBets.reduce((sum, row) => sum + row.amount, 0);
    const payouts = calculateParimutuelPayouts({
      totalPool,
      winnerPool,
      winningBets,
    });

    for (const payout of payouts) {
      await tx
        .update(user)
        .set({ credits: sql`${user.credits} + ${payout.amount}` })
        .where(eq(user.id, payout.userId));

      await tx.insert(transaction).values({
        id: randomUUID(),
        userId: payout.userId,
        delta: payout.amount,
        reason: "payout",
        refType: "market",
        refId: input.marketId,
      });
    }

    await tx
      .update(market)
      .set({
        outcome: input.outcome,
        status: "resolved",
        resolvedAt: new Date(),
      })
      .where(eq(market.id, input.marketId));

    return {
      payouts: payouts.length,
      resolved: true,
      totalPool,
      winnerPool,
    };
  });
}

async function getMarkets(db: Database, id?: string) {
  const serverNow = new Date();
  const rows = await db
    .select({
      closesAt: market.closesAt,
      createdBy: market.createdBy,
      description: market.description,
      id: market.id,
      noPool: sql<number>`coalesce(sum(case when ${bet.side} = 'no' then ${bet.amount} else 0 end), 0)::int`,
      outcome: market.outcome,
      status: market.status,
      title: market.title,
      yesPool: sql<number>`coalesce(sum(case when ${bet.side} = 'yes' then ${bet.amount} else 0 end), 0)::int`,
    })
    .from(market)
    .leftJoin(bet, eq(bet.marketId, market.id))
    .where(id ? eq(market.id, id) : undefined)
    .groupBy(
      market.closesAt,
      market.createdAt,
      market.createdBy,
      market.description,
      market.id,
      market.outcome,
      market.status,
      market.title
    )
    .orderBy(desc(market.createdAt));

  return rows.map((row) => ({
    ...row,
    closesAt: row.closesAt.toISOString(),
    outcome: row.outcome as MarketSide | undefined,
    serverNow: serverNow.toISOString(),
  }));
}

function calculateParimutuelPayouts({
  totalPool,
  winnerPool,
  winningBets,
}: {
  totalPool: number;
  winnerPool: number;
  winningBets: WinningBet[];
}) {
  if (winnerPool <= 0 || totalPool <= 0) {
    return [];
  }

  const payouts = winningBets.map((row, index) => {
    const weightedAmount = row.amount * totalPool;

    return {
      amount: Math.floor(weightedAmount / winnerPool),
      index,
      remainder: weightedAmount % winnerPool,
      userId: row.userId,
    };
  });
  const paidTotal = payouts.reduce((sum, row) => sum + row.amount, 0);
  const remainingCoins = totalPool - paidTotal;
  const remainderOrder = [...payouts].sort((left, right) => {
    if (right.remainder !== left.remainder) {
      return right.remainder - left.remainder;
    }

    return left.index - right.index;
  });

  for (const payout of remainderOrder.slice(0, remainingCoins)) {
    payout.amount += 1;
  }

  return payouts
    .filter((row) => row.amount > 0)
    .map(({ amount, userId }) => ({
      amount,
      userId,
    }));
}

function toApiMarket(
  row: typeof market.$inferSelect,
  yesPool: number,
  noPool: number,
  serverNow: Date
) {
  return {
    closesAt: row.closesAt.toISOString(),
    createdBy: row.createdBy,
    description: row.description,
    id: row.id,
    noPool,
    outcome: row.outcome as MarketSide | undefined,
    serverNow: serverNow.toISOString(),
    status: row.status,
    title: row.title,
    yesPool,
  };
}
