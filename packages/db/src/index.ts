import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "./env";

import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "./schema/auth";

import {
  bet,
  betRelations,
  market,
  marketRelations,
  transaction,
  transactionRelations,
} from "./schema/markets";

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

export function createDb() {
  return drizzle(env.DATABASE_URL, { schema });
}

export const db = createDb();
