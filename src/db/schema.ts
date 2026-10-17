import {
  boolean, index, integer, pgEnum, pgTable, primaryKey, text, timestamp,
  uniqueIndex, uuid, varchar,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const users = pgTable("user", {
  id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false), image: text("image"),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [uniqueIndex("user_email_unique").on(table.email)]);

export const sessions = pgTable("session", {
  id: text("id").primaryKey(), expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull(), createdAt: createdAt(), updatedAt: updatedAt(),
  ipAddress: text("ip_address"), userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
}, (table) => [
  uniqueIndex("session_token_unique").on(table.token),
  index("session_user_id_idx").on(table.userId),
]);

export const accounts = pgTable("account", {
  id: text("id").primaryKey(), accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"), refreshToken: text("refresh_token"), idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"), password: text("password"), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [index("account_user_id_idx").on(table.userId)]);

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(), identifier: text("identifier").notNull(), value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const workspaceRole = pgEnum("workspace_role", ["owner", "admin", "member"]);
export const projectStatus = pgEnum("project_status", ["active", "completed", "archived"]);
export const taskStatus = pgEnum("task_status", ["todo", "in_progress", "done"]);
export const taskPriority = pgEnum("task_priority", ["low", "medium", "high"]);
export const focusMode = pgEnum("focus_mode", ["focus", "short_break", "long_break"]);

export const workspaces = pgTable("workspace", {
  id: uuid("id").defaultRandom().primaryKey(), name: varchar("name", { length: 120 }).notNull(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [index("workspace_owner_id_idx").on(table.ownerId)]);

export const workspaceMembers = pgTable("workspace_member", {
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: workspaceRole("role").notNull().default("member"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.workspaceId, table.userId] }),
  index("workspace_member_user_id_idx").on(table.userId),
]);

export const projects = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(), description: text("description"),
  status: projectStatus("status").notNull().default("active"),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [index("project_workspace_id_idx").on(table.workspaceId)]);

export const tasks = pgTable("task", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
  title: varchar("title", { length: 240 }).notNull(), description: text("description"),
  status: taskStatus("status").notNull().default("todo"),
  priority: taskPriority("priority").notNull().default("medium"),
  dueAt: timestamp("due_at", { withTimezone: true }), sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [
  index("task_workspace_id_idx").on(table.workspaceId), index("task_project_id_idx").on(table.projectId),
  index("task_assignee_id_idx").on(table.assigneeId), index("task_status_idx").on(table.status),
]);

export const goals = pgTable("goal", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(), description: text("description"),
  targetDate: timestamp("target_date", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [index("goal_workspace_id_idx").on(table.workspaceId), index("goal_owner_id_idx").on(table.ownerId)]);

export const focusSessions = pgTable("focus_session", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
  title: varchar("title", { length: 200 }), mode: focusMode("mode").notNull().default("focus"),
  durationSeconds: integer("duration_seconds").notNull().default(1500),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }), createdAt: createdAt(),
}, (table) => [
  index("focus_session_user_id_idx").on(table.userId),
  index("focus_session_workspace_id_idx").on(table.workspaceId),
  index("focus_session_started_at_idx").on(table.startedAt),
]);
