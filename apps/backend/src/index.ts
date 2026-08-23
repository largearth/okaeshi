import { Hono } from "hono";
import { cors } from "hono/cors";

import { createAuth, type AuthBindings } from "./auth";
import { api } from "./api";
import { createDb, type Database } from "./db/client";

type AppEnvironment = {
  Bindings: {
    ENVIRONMENT: "development" | "production";
  } & AuthBindings;
  Variables: {
    db: Database;
  };
};

const app = new Hono<AppEnvironment>();

app.use("/api/*", async (c, next) => {
  const origin = c.req.header("Origin");

  return cors({
    origin: origin === c.env.WEB_ORIGIN ? c.env.WEB_ORIGIN : "",
    credentials: true,
  })(c, next);
});

app.use("*", async (c, next) => {
  c.set("db", createDb(c.env.DATABASE_URL));
  await next();
});

app.all("/api/auth/*", (c) => {
  return createAuth(c.env).handler(c.req.raw);
});

app.route("/api", api);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
