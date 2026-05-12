import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export const generationModeEnum = pgEnum("generation_mode", [
  "generate",
  "iterate",
  "repair",
  "explain"
]);

export const generationStatusEnum = pgEnum("generation_status", [
  "queued",
  "running",
  "succeeded",
  "failed"
]);

export const quotaOperationEnum = pgEnum("quota_operation", [
  "generate",
  "iterate",
  "repair",
  "export"
]);

export const userProfiles = pgTable("user_profiles", {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  displayName: text("display_name"),
  email: text("email"),
  id: uuid("id").primaryKey(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const projects = pgTable(
  "projects",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    currentVersionId: uuid("current_version_id"),
    defaultStyle: text("default_style"),
    description: text("description"),
    id: uuid("id").defaultRandom().primaryKey(),
    initialPrompt: text("initial_prompt"),
    isArchived: boolean("is_archived").default(false).notNull(),
    name: text("name").notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    ownerIdx: index("projects_owner_id_idx").on(table.ownerId)
  })
);

export const pages = pgTable(
  "pages",
  {
    content: jsonb("content").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    filePath: text("file_path"),
    id: uuid("id").defaultRandom().primaryKey(),
    isHome: boolean("is_home").default(false).notNull(),
    name: text("name").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    route: text("route").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    projectIdx: index("pages_project_id_idx").on(table.projectId)
  })
);

export const projectVersions = pgTable(
  "project_versions",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => userProfiles.id),
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    summary: text("summary").notNull(),
    versionNumber: integer("version_number").notNull()
  },
  (table) => ({
    projectIdx: index("project_versions_project_id_idx").on(table.projectId)
  })
);

export const conversationMessages = pgTable(
  "conversation_messages",
  {
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    versionId: uuid("version_id").references(() => projectVersions.id)
  },
  (table) => ({
    projectIdx: index("conversation_messages_project_id_idx").on(table.projectId)
  })
);

export const generationRequests = pgTable(
  "generation_requests",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    mode: generationModeEnum("mode").notNull(),
    prompt: text("prompt").notNull(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    requestedById: uuid("requested_by_id")
      .notNull()
      .references(() => userProfiles.id),
    status: generationStatusEnum("status").default("queued").notNull()
  },
  (table) => ({
    requestedByIdx: index("generation_requests_requested_by_id_idx").on(table.requestedById)
  })
);

export const generationResults = pgTable("generation_results", {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  errorMessage: text("error_message"),
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => generationRequests.id, { onDelete: "cascade" }),
  result: jsonb("result").$type<Record<string, unknown>>(),
  validationStatus: text("validation_status").notNull()
});

export const exportRecords = pgTable(
  "export_records",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    exportType: text("export_type").notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    requestedById: uuid("requested_by_id")
      .notNull()
      .references(() => userProfiles.id),
    status: text("status").notNull(),
    versionId: uuid("version_id").references(() => projectVersions.id)
  },
  (table) => ({
    projectIdx: index("export_records_project_id_idx").on(table.projectId)
  })
);

export const quotas = pgTable(
  "quotas",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    operationType: quotaOperationEnum("operation_type").notNull(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    units: integer("units").default(1).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" })
  },
  (table) => ({
    userIdx: index("quotas_user_id_idx").on(table.userId)
  })
);
