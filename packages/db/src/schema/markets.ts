import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const market = pgTable(
  "market",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("open"),
    outcome: text("outcome"),
    closesAt: timestamp("closes_at").notNull(),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("market_status_idx").on(table.status),
    index("market_createdBy_idx").on(table.createdBy),
  ]
);

export const bet = pgTable(
  "bet",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    marketId: text("market_id")
      .notNull()
      .references(() => market.id, { onDelete: "cascade" }),
    side: text("side").notNull(),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("bet_marketId_idx").on(table.marketId),
    index("bet_userId_idx").on(table.userId),
    index("bet_marketId_side_idx").on(table.marketId, table.side),
  ]
);

export const transaction = pgTable(
  "transaction",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    refType: text("ref_type"),
    refId: text("ref_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("transaction_userId_idx").on(table.userId),
    index("transaction_refType_refId_idx").on(table.refType, table.refId),
  ]
);

export const marketRelations = relations(market, ({ one, many }) => ({
  creator: one(user, {
    fields: [market.createdBy],
    references: [user.id],
  }),
  bets: many(bet),
}));

export const betRelations = relations(bet, ({ one }) => ({
  user: one(user, {
    fields: [bet.userId],
    references: [user.id],
  }),
  market: one(market, {
    fields: [bet.marketId],
    references: [market.id],
  }),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
}));
