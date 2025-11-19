CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" integer NOT NULL,
	"username" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
