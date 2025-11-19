import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

import * as schema from "./schemas";

const sql = new Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number.parseInt(process.env.POSTGRES_PORT!, 10),
  database: process.env.POSTGRES_DB,
});

await sql.connect();

export const db = drizzle(sql, {
  schema,
});
