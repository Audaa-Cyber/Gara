ALTER TABLE "focus_sessions" ADD COLUMN "endsAt" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD COLUMN "remainingSeconds" integer;
--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD COLUMN "pausedAt" timestamp with time zone;
