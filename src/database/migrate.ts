import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

const sql = new Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number.parseInt(process.env.POSTGRES_PORT!, 10),
  database: process.env.POSTGRES_DB,
});

const db = drizzle(sql);

const main = async () => {
  try {
    await sql.connect();

    await migrate(db, {
      migrationsFolder: "src/database/migrations",
    });

    // eslint-disable-next-line no-console
    console.log("Migration successful");
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await sql.end();
  }
};

main();
