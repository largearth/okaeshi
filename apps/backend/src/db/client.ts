import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export const createDb = (databaseUrl: string) =>
  drizzle({
    connection: databaseUrl,
    schema,
  });

export type Database = ReturnType<typeof createDb>;
