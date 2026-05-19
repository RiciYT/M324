import type { createDb } from "@M324/db";
import { user } from "@M324/db/schema/auth";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

import { auth } from "../auth.js";

export interface SessionUser {
  credits: number;
  id: string;
  name: string;
  role: string;
}

export interface AppEnv {
  Variables: {
    sessionUser: SessionUser;
  };
}

type Database = ReturnType<typeof createDb>;

export const createRequireSession = (db: Database) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user?.id) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const [sessionUser] = await db
      .select({
        credits: user.credits,
        id: user.id,
        name: user.name,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, session.user.id));

    if (!sessionUser) {
      return c.json({ error: "Authentication required" }, 401);
    }

    c.set("sessionUser", sessionUser);
    await next();
  });

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const sessionUser = c.get("sessionUser");

  if (sessionUser.role !== "admin") {
    return c.json({ error: "Admin required" }, 403);
  }

  await next();
});
