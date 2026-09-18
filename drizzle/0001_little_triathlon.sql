ALTER TABLE "extraction" ADD COLUMN "reminder_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;