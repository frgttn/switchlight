# Switchlight

Telegram bot for broadcasting planned power outages using Yasno's public API, powered by Node.js, TypeScript, Drizzle ORM, and PostgreSQL.

## Prerequisites

- Docker and Docker Compose v2
- Node.js 20+ (only required for local development outside Docker)
- A valid `TELEGRAM_API_TOKEN` with permissions to control your bot

## Environment variables

Copy `.env.example` to `.env` and fill in the secrets before running anything:

```bash
cp .env.example .env
```

When running via Docker Compose the values from `.env` are injected automatically, while the application container overrides `POSTGRES_HOST` to talk to the bundled database service. You can toggle automatic migrations with `RUN_MIGRATIONS=false` on the `bot` service if needed.

## Run with Docker

1. Build the application image (only required after code changes):

   ```bash
   docker compose build bot
   ```

2. Start the bot and PostgreSQL database in the background:

   ```bash
   docker compose up -d
   ```

3. Tail the bot logs:

   ```bash
   docker compose logs -f bot
   ```

The entrypoint runs the compiled migrations (`node dist/database/migrate.js`) before launching the bot so the schema always matches the code. To skip migrations for faster restarts, set `RUN_MIGRATIONS=false` in the `bot` service environment.

## Local development without Docker

```bash
npm install
npm run db:migrate
npm run dev
```

By default the scripts expect a local PostgreSQL instance that matches the credentials from `.env`.

## Helpful Compose commands

- Stop services: `docker compose down`
- Recreate only the database: `docker compose up -d postgres`
- Run migrations manually inside the container: `docker compose run --rm bot node dist/database/migrate.js`

## Project scripts

- `npm run dev` – start the bot with `tsx` in watch mode
- `npm run build` – compile TypeScript to `dist`
- `npm run db:migrate` – run Drizzle migrations using the current environment
- `npm run db:generate` – generate SQL migrations from schema changes
- `npm run db:studio` – open the Drizzle Studio dashboard on port 8081
