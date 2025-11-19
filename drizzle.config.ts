import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database/schemas",
  out: "./src/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    host: process.env.POSTGRES_HOST!,
    port: Number.parseInt(process.env.POSTGRES_PORT!, 10),
    database: process.env.POSTGRES_DB!,
    ssl: process.env.NODE_ENV! !== "development",
  },
});
