import type { createDb } from "@M324/db";
import { user } from "@M324/db/schema/auth";
import { bet, market, transaction } from "@M324/db/schema/markets";
import { randomUUID } from "node:crypto";
import { and, eq, gte, sql } from "drizzle-orm";

import { ServiceError } from "./errors.js";

type Database = ReturnType<typeof createDb>;
type MarketSide = "yes" | "no";

interface PlaceBetInput {
  amount: number;
  marketId: string;
  side: MarketSide;
}

export async function placeBet(
  db: Database,
  input: PlaceBetInput,
  userId: string
) {
  return await db.transaction(async (tx) => {
    const [selectedMarket] = await tx
      .select({
        closesAt: market.closesAt,
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
      throw new ServiceError(409, "Market is not open");
    }

    if (selectedMarket.closesAt.getTime() <= Date.now()) {
      throw new ServiceError(400, "Market is closed");
    }

    const [updatedUser] = await tx
      .update(user)
      .set({ credits: sql`${user.credits} - ${input.amount}` })
      .where(and(eq(user.id, userId), gte(user.credits, input.amount)))
      .returning({
        credits: user.credits,
      });

    if (!updatedUser) {
      throw new ServiceError(400, "Insufficient credits");
    }

    await tx.insert(bet).values({
      id: randomUUID(),
      userId,
      marketId: input.marketId,
      side: input.side,
      amount: input.amount,
    });

    await tx.insert(transaction).values({
      id: randomUUID(),
      userId,
      delta: -input.amount,
      reason: "bet",
      refType: "market",
      refId: input.marketId,
    });

    return {
      accepted: true,
      credits: updatedUser.credits,
    };
  });
}
