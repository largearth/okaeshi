import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";

import { createDb } from "../db/client";
import { accounts, sessions, users, verifications } from "../db/schema";

export type AuthBindings = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  WEB_ORIGIN: string;
};

const required = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} must be configured`);
  }

  return value;
};

export const createAuth = (env: AuthBindings) => {
  const db = createDb(required(env.DATABASE_URL, "DATABASE_URL"));

  return betterAuth({
    baseURL: required(env.BETTER_AUTH_URL, "BETTER_AUTH_URL"),
    secret: required(env.BETTER_AUTH_SECRET, "BETTER_AUTH_SECRET"),
    trustedOrigins: [required(env.WEB_ORIGIN, "WEB_ORIGIN")],
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        users,
        sessions,
        accounts,
        verifications,
      },
    }),
    user: {
      modelName: "users",
      fields: {
        image: "avatarUrl",
      },
    },
    session: {
      modelName: "sessions",
    },
    account: {
      modelName: "accounts",
    },
    verification: {
      modelName: "verifications",
    },
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 12,
    },
  });
};
