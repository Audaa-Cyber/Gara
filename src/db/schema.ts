import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("createdAt", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow();

// Better Auth tables. Keep field names aligned with Better Auth's Drizzle adapter.
export const userTable = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("user_email_unique").on(table.email)],
);

export const sessionTable = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("session_token_unique").on(table.token),
    index("session_user_id_idx").on(table.userId),
  ],
);

export const accountTable = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verificationTable = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const goals = pgTable(
  "goals",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    targetDate: timestamp("targetDate", { withTimezone: true }),
    status: text("status").notNull().default("active"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("goals_user_id_idx").on(table.userId)],
);

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").notNull().default("#7b8f70"),
    archived: boolean("archived").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("projects_user_id_idx").on(table.userId)],
);

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    projectId: text("projectId").references(() => projects.id, { onDelete: "set null" }),
    goalId: text("goalId").references(() => goals.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("todo"),
    priority: text("priority").notNull().default("medium"),
    dueAt: timestamp("dueAt", { withTimezone: true }),
    completedAt: timestamp("completedAt", { withTimezone: true }),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("tasks_user_id_idx").on(table.userId),
    index("tasks_project_id_idx").on(table.projectId),
    index("tasks_goal_id_idx").on(table.goalId),
    index("tasks_user_status_idx").on(table.userId, table.status),
  ],
);

export const focusSessions = pgTable(
  "focus_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    taskId: text("taskId").references(() => tasks.id, { onDelete: "set null" }),
    mode: text("mode").notNull().default("focus"),
    status: text("status").notNull().default("completed"),
    plannedSeconds: integer("plannedSeconds").notNull(),
    actualSeconds: integer("actualSeconds").notNull().default(0),
    startedAt: timestamp("startedAt", { withTimezone: true }).notNull(),
    endsAt: timestamp("endsAt", { withTimezone: true }),
    remainingSeconds: integer("remainingSeconds"),
    pausedAt: timestamp("pausedAt", { withTimezone: true }),
    endedAt: timestamp("endedAt", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    index("focus_sessions_user_id_idx").on(table.userId),
    index("focus_sessions_started_at_idx").on(table.startedAt),
  ],
);

export const groups = pgTable(
  "groups",
  {
    id: text("id").primaryKey(),
    ownerId: text("ownerId").notNull().references(() => userTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("groups_owner_id_idx").on(table.ownerId)],
);

export const groupMembers = pgTable(
  "group_members",
  {
    id: text("id").primaryKey(),
    groupId: text("groupId").notNull().references(() => groups.id, { onDelete: "cascade" }),
    userId: text("userId").notNull().references(() => userTable.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joinedAt", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("group_members_group_user_unique").on(table.groupId, table.userId),
    index("group_members_user_id_idx").on(table.userId),
  ],
);

export const groupInvitations = pgTable(
  "group_invitations",
  {
    id: text("id").primaryKey(),
    groupId: text("groupId").notNull().references(() => groups.id, { onDelete: "cascade" }),
    inviterId: text("inviterId").notNull().references(() => userTable.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    tokenHash: text("tokenHash").notNull(),
    status: text("status").notNull().default("pending"),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("acceptedAt", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("group_invitations_token_hash_unique").on(table.tokenHash),
    index("group_invitations_group_email_status_idx").on(table.groupId, table.email, table.status),
  ],
);

export const authSchema = {
  user: userTable,
  session: sessionTable,
  account: accountTable,
  verification: verificationTable,
};