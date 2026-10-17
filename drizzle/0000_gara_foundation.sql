CREATE TABLE "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "emailVerified" boolean DEFAULT false NOT NULL,
  "image" text,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_unique" ON "user" USING btree ("email");
--> statement-breakpoint
CREATE TABLE "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expiresAt" timestamp with time zone NOT NULL,
  "token" text NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_unique" ON "session" USING btree ("token");
--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");
--> statement-breakpoint
CREATE TABLE "account" (
  "id" text PRIMARY KEY NOT NULL,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp with time zone,
  "refreshTokenExpiresAt" timestamp with time zone,
  "scope" text,
  "password" text,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");
--> statement-breakpoint
CREATE TABLE "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp with time zone NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");
--> statement-breakpoint
CREATE TABLE "goals" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text,
  "targetDate" timestamp with time zone,
  "status" text DEFAULT 'active' NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "goals_user_id_idx" ON "goals" USING btree ("userId");
--> statement-breakpoint
CREATE TABLE "projects" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "color" text DEFAULT '#7b8f70' NOT NULL,
  "archived" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "projects_user_id_idx" ON "projects" USING btree ("userId");
--> statement-breakpoint
CREATE TABLE "tasks" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "projectId" text REFERENCES "projects"("id") ON DELETE SET NULL,
  "goalId" text REFERENCES "goals"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'todo' NOT NULL,
  "priority" text DEFAULT 'medium' NOT NULL,
  "dueAt" timestamp with time zone,
  "completedAt" timestamp with time zone,
  "position" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "tasks_user_id_idx" ON "tasks" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX "tasks_project_id_idx" ON "tasks" USING btree ("projectId");
--> statement-breakpoint
CREATE INDEX "tasks_goal_id_idx" ON "tasks" USING btree ("goalId");
--> statement-breakpoint
CREATE INDEX "tasks_user_status_idx" ON "tasks" USING btree ("userId", "status");
--> statement-breakpoint
CREATE TABLE "focus_sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "taskId" text REFERENCES "tasks"("id") ON DELETE SET NULL,
  "mode" text DEFAULT 'focus' NOT NULL,
  "status" text DEFAULT 'completed' NOT NULL,
  "plannedSeconds" integer NOT NULL,
  "actualSeconds" integer DEFAULT 0 NOT NULL,
  "startedAt" timestamp with time zone NOT NULL,
  "endedAt" timestamp with time zone,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "focus_sessions_user_id_idx" ON "focus_sessions" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX "focus_sessions_started_at_idx" ON "focus_sessions" USING btree ("startedAt");