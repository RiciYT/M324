import { createDb } from "@M324/db";
import { account, session, user, verification } from "@M324/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { createSocialProviders } from "./auth-social-providers.js";
import { env } from "./env.js";
import { getConfiguredOrigins } from "./origins.js";

const trustedOrigins = getConfiguredOrigins(env.CORS_ORIGIN);

const schema = {
  account,
  session,
  user,
  verification,
};

export function createAuth() {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",

      schema,
    }),
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: createSocialProviders(env),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    plugins: [],
  });
}

export const auth = createAuth();
