import { describe, expect, it } from "vitest";

import { createAuth } from ".";

const env = {
  DATABASE_URL: "postgresql://user:password@example.test/database",
  BETTER_AUTH_SECRET: "a-secret-with-at-least-thirty-two-characters",
  BETTER_AUTH_URL: "http://localhost:8787",
  WEB_ORIGIN: "http://localhost:5173",
};

describe("Better Auth configuration", () => {
  it("uses the existing users table and enables password login without sign-up", () => {
    const auth = createAuth(env);

    expect(auth.options.user.modelName).toBe("users");
    expect(auth.options.emailAndPassword?.enabled).toBe(true);
    expect(auth.options.emailAndPassword?.disableSignUp).toBe(true);
    expect(auth.options.trustedOrigins).toContain(env.WEB_ORIGIN);
  });
});
