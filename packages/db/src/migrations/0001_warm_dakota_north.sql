CREATE TABLE "bet" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"market_id" text NOT NULL,
	"side" text NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_by" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"outcome" text,
	"closes_at" timestamp NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"delta" integer NOT NULL,
	"reason" text NOT NULL,
	"ref_type" text,
	"ref_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "credits" integer DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_market_id_market_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."market"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market" ADD CONSTRAINT "market_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bet_marketId_idx" ON "bet" USING btree ("market_id");--> statement-breakpoint
CREATE INDEX "bet_userId_idx" ON "bet" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bet_marketId_side_idx" ON "bet" USING btree ("market_id","side");--> statement-breakpoint
CREATE INDEX "market_status_idx" ON "market" USING btree ("status");--> statement-breakpoint
CREATE INDEX "market_createdBy_idx" ON "market" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "transaction_userId_idx" ON "transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transaction_refType_refId_idx" ON "transaction" USING btree ("ref_type","ref_id");