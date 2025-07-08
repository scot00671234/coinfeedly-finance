CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

CREATE TABLE IF NOT EXISTS "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"summary" text NOT NULL,
	"category" text NOT NULL,
	"author_name" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"image_url" text,
	"featured" boolean DEFAULT false,
	"tags" text[],
	"related_symbols" text[],
	"view_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "market_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"price" numeric(18,8) NOT NULL,
	"change" numeric(18,8) NOT NULL,
	"change_percent" numeric(10,4) NOT NULL,
	"volume" numeric(20,2),
	"market_cap" numeric(20,2),
	"type" text NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "market_data_symbol_type_unique" UNIQUE("symbol","type")
);

CREATE TABLE IF NOT EXISTS "news_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text,
	"description" text,
	"category" text,
	"source" text NOT NULL,
	"url" text,
	"published_at" timestamp with time zone NOT NULL,
	"processed" boolean DEFAULT false,
	"article_id" integer
);

CREATE INDEX IF NOT EXISTS "idx_articles_category" ON "articles" ("category");
CREATE INDEX IF NOT EXISTS "idx_articles_featured" ON "articles" ("featured");
CREATE INDEX IF NOT EXISTS "idx_articles_published_at" ON "articles" ("published_at");
CREATE INDEX IF NOT EXISTS "idx_news_events_processed" ON "news_events" ("processed");
CREATE INDEX IF NOT EXISTS "idx_market_data_symbol" ON "market_data" ("symbol");