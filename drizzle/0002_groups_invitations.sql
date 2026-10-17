CREATE TABLE "groups" (
  "id" text PRIMARY KEY NOT NULL,
  "ownerId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "groups_owner_id_idx" ON "groups" USING btree ("ownerId");
--> statement-breakpoint
CREATE TABLE "group_members" (
  "id" text PRIMARY KEY NOT NULL,
  "groupId" text NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" text DEFAULT 'member' NOT NULL,
  "joinedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "group_members_group_user_unique" ON "group_members" USING btree ("groupId", "userId");
--> statement-breakpoint
CREATE INDEX "group_members_user_id_idx" ON "group_members" USING btree ("userId");
--> statement-breakpoint
CREATE TABLE "group_invitations" (
  "id" text PRIMARY KEY NOT NULL,
  "groupId" text NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "inviterId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "tokenHash" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "expiresAt" timestamp with time zone NOT NULL,
  "acceptedAt" timestamp with time zone,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "group_invitations_token_hash_unique" ON "group_invitations" USING btree ("tokenHash");
--> statement-breakpoint
CREATE INDEX "group_invitations_group_email_status_idx" ON "group_invitations" USING btree ("groupId", "email", "status");
