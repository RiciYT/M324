import type { createDb } from "@M324/db";
import { user } from "@M324/db/schema/auth";
import { transaction } from "@M324/db/schema/markets";
import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";

import { ServiceError } from "./errors.js";

type Database = ReturnType<typeof createDb>;

const DAILY_CLAIM_AMOUNT = 1000;
const DAILY_CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DAILY_CLAIM_REASON = "daily_claim";

export async function getWallet(
  db: Database,
  sessionUser: { credits: number; id: string; role: string }
) {
  const dailyClaim = await getDailyClaimState(db, sessionUser.id);

  return {
    canClaimDailyCoins: dailyClaim.canClaimDailyCoins,
    credits: sessionUser.credits,
    nextDailyClaimAt: dailyClaim.nextDailyClaimAt?.toISOString(),
    role: sessionUser.role,
  };
}

export async function claimDailyCoins(
  db: Database,
  sessionUser: { id: string; role: string }
) {
  return await db.transaction(async (tx) => {
    const dailyClaim = await getDailyClaimState(tx, sessionUser.id);

    if (!dailyClaim.canClaimDailyCoins) {
      throw new ServiceError(429, "Daily coins already claimed");
    }

    await tx.insert(transaction).values({
      id: randomUUID(),
      userId: sessionUser.id,
      delta: DAILY_CLAIM_AMOUNT,
      reason: DAILY_CLAIM_REASON,
      refType: "wallet",
      refId: sessionUser.id,
    });

    const [updatedUser] = await tx
      .update(user)
      .set({ credits: sql`${user.credits} + ${DAILY_CLAIM_AMOUNT}` })
      .where(eq(user.id, sessionUser.id))
      .returning({
        credits: user.credits,
      });

    if (!updatedUser) {
      throw new Error("Daily claim failed");
    }

    return {
      canClaimDailyCoins: false,
      credits: updatedUser.credits,
      grantedCredits: DAILY_CLAIM_AMOUNT,
      nextDailyClaimAt: new Date(
        Date.now() + DAILY_CLAIM_COOLDOWN_MS
      ).toISOString(),
      role: sessionUser.role,
    };
  });
}

async function getDailyClaimState<TDatabase extends Pick<Database, "select">>(
  db: TDatabase,
  userId: string
) {
  const [lastDailyClaim] = await db
    .select({
      createdAt: transaction.createdAt,
    })
    .from(transaction)
    .where(
      and(
        eq(transaction.userId, userId),
        eq(transaction.reason, DAILY_CLAIM_REASON)
      )
    )
    .orderBy(desc(transaction.createdAt))
    .limit(1);

  if (!lastDailyClaim) {
    return {
      canClaimDailyCoins: true,
      nextDailyClaimAt: undefined,
    };
  }

  const nextDailyClaimAt = new Date(
    lastDailyClaim.createdAt.getTime() + DAILY_CLAIM_COOLDOWN_MS
  );

  return {
    canClaimDailyCoins: nextDailyClaimAt.getTime() <= Date.now(),
    nextDailyClaimAt,
  };
}
