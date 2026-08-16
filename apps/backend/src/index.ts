import { Hono } from "hono";

import { createDb, type Database } from "./db/client";

type AppEnvironment = {
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    db: Database;
  };
};

const app = new Hono<AppEnvironment>();

app.use("*", async (c, next) => {
  c.set("db", createDb(c.env.DATABASE_URL));
  await next();
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
