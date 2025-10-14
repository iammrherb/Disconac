import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// AUTH TABLES (Required for Replit Auth)
// ============================================================================

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================================================
// APPLICATION TABLES
// ============================================================================

// Customer profiles table
export const customerProfiles = pgTable("customer_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  industry: text("industry"),
  companySize: text("company_size"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scoping sessions table
export const scopingSessions = pgTable("scoping_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
  sessionName: text("session_name").notNull(),
  version: text("version").default("2.1"),
  status: text("status").notNull().default("draft"), // draft, in_progress, completed
  isArchived: boolean("is_archived").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Questionnaire responses table - stores all scoping data
export const questionnaireResponses = pgTable("questionnaire_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => scopingSessions.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // e.g., "Company Profile", "Network Infrastructure", etc.
  subcategory: text("subcategory"), // e.g., "Wired Network", "Wireless Network"
  question: text("question").notNull(),
  responseType: text("response_type").notNull(), // select, multiselect, text, number, date, checkbox
  response: jsonb("response").notNull(), // stores the actual response (string, array, number, etc.)
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documentation links table - from Portnox docs
export const documentationLinks = pgTable("documentation_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"), // parsed from URL or content
  tags: text("tags").array(), // searchable tags
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Deployment checklist items - auto-generated from scoping responses
export const deploymentChecklists = pgTable("deployment_checklists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => scopingSessions.id, { onDelete: "cascade" }),
  itemTitle: text("item_title").notNull(),
  itemDescription: text("item_description"),
  category: text("category").notNull(),
  priority: text("priority").default("medium"), // high, medium, low
  completed: boolean("completed").default(false),
  relatedDocUrl: text("related_doc_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Approved documentation - tracks user-approved docs for each session
export const approvedDocumentation = pgTable("approved_documentation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => scopingSessions.id, { onDelete: "cascade" }),
  documentationId: varchar("documentation_id").notNull().references(() => documentationLinks.id, { onDelete: "cascade" }),
  approved: boolean("approved").notNull().default(true),
  reviewNotes: text("review_notes"),
  approvedAt: timestamp("approved_at").defaultNow(),
  approvedBy: varchar("approved_by").references(() => users.id),
}, (table) => [
  index("idx_approved_docs_session").on(table.sessionId),
  index("idx_approved_docs_documentation").on(table.documentationId),
  unique("unique_session_doc").on(table.sessionId, table.documentationId),
]);

// Application settings - stores API keys and configuration
export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // e.g., "firecrawl_api_key", "auto_refresh_enabled"
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Checklist templates - Portnox-branded deployment templates
export const checklistTemplates = pgTable("checklist_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Standard NAC Deployment", "ZTNA Quick Start"
  description: text("description"),
  category: text("category").notNull(), // NAC, ZTNA, TACACS+
  version: text("version").default("1.0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Template checklist items - Reusable task definitions
export const checklistItemsTemplate = pgTable("checklist_items_template", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => checklistTemplates.id, { onDelete: "cascade" }),
  phase: text("phase").notNull(), // e.g., "Prerequisites", "Phase 1: Planning", "Phase 2: Deployment"
  itemTitle: text("item_title").notNull(),
  itemDescription: text("item_description"),
  bestPractice: text("best_practice"), // Detailed best practice guidance
  prerequisites: text("prerequisites").array(), // Array of prerequisite steps
  estimatedHours: integer("estimated_hours"),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  relatedDocUrls: text("related_doc_urls").array(), // Array of documentation links
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_template_items_template").on(table.templateId, table.sortOrder),
]);

// Custom option catalogs - User-defined option sets
export const optionCatalogs = pgTable("option_catalogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "My Network Vendors", "Custom Device Types"
  type: text("type").notNull(), // vendor, device_type, category, application, etc.
  description: text("description"),
  isShared: boolean("is_shared").default(false), // Can be shared across users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Option values within catalogs
export const optionValues = pgTable("option_values", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  catalogId: varchar("catalog_id").notNull().references(() => optionCatalogs.id, { onDelete: "cascade" }),
  value: text("value").notNull(), // e.g., "Cisco ISE", "Aruba ClearPass"
  label: text("label").notNull(), // Display name
  metadata: jsonb("metadata"), // Additional properties (version, capabilities, etc.)
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_option_values_catalog").on(table.catalogId, table.sortOrder),
]);

// NAC migration assessments
export const nacAssessments = pgTable("nac_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => scopingSessions.id, { onDelete: "cascade" }),
  currentVendor: text("current_vendor"), // Existing NAC vendor
  currentVersion: text("current_version"),
  deploymentSize: text("deployment_size"), // small, medium, large, enterprise
  currentCapabilities: text("current_capabilities").array(), // Array of current NAC features in use
  desiredCapabilities: text("desired_capabilities").array(), // Desired Portnox features
  migrationComplexity: text("migration_complexity"), // low, medium, high
  estimatedTimeline: text("estimated_timeline"), // e.g., "3-6 months"
  riskFactors: text("risk_factors").array(), // Identified migration risks
  recommendedPath: text("recommended_path"), // Generated recommendation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project milestones for timeline planning
export const projectMilestones = pgTable("project_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => scopingSessions.id, { onDelete: "cascade" }),
  phase: text("phase").notNull(), // e.g., "Planning", "POC", "Pilot", "Production Rollout"
  phaseName: text("phase_name").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  owner: text("owner"), // Person/team responsible
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed, blocked
  percentComplete: integer("percent_complete").notNull().default(0),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_milestones_session").on(table.sessionId, table.sortOrder),
]);

// Tasks within project milestones
export const milestoneTasks = pgTable("milestone_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  milestoneId: varchar("milestone_id").notNull().references(() => projectMilestones.id, { onDelete: "cascade" }),
  taskName: text("task_name").notNull(),
  taskDescription: text("task_description"),
  assignee: text("assignee"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_milestone_tasks").on(table.milestoneId, table.sortOrder),
]);

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  customerProfiles: many(customerProfiles),
  optionCatalogs: many(optionCatalogs),
}));

export const customerProfilesRelations = relations(customerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [customerProfiles.userId],
    references: [users.id],
  }),
  scopingSessions: many(scopingSessions),
}));

export const scopingSessionsRelations = relations(scopingSessions, ({ one, many }) => ({
  customer: one(customerProfiles, {
    fields: [scopingSessions.customerId],
    references: [customerProfiles.id],
  }),
  responses: many(questionnaireResponses),
  checklists: many(deploymentChecklists),
  approvedDocs: many(approvedDocumentation),
  nacAssessment: one(nacAssessments),
  milestones: many(projectMilestones),
}));

export const questionnaireResponsesRelations = relations(questionnaireResponses, ({ one }) => ({
  session: one(scopingSessions, {
    fields: [questionnaireResponses.sessionId],
    references: [scopingSessions.id],
  }),
}));

export const deploymentChecklistsRelations = relations(deploymentChecklists, ({ one }) => ({
  session: one(scopingSessions, {
    fields: [deploymentChecklists.sessionId],
    references: [scopingSessions.id],
  }),
}));

export const approvedDocumentationRelations = relations(approvedDocumentation, ({ one }) => ({
  session: one(scopingSessions, {
    fields: [approvedDocumentation.sessionId],
    references: [scopingSessions.id],
  }),
  documentation: one(documentationLinks, {
    fields: [approvedDocumentation.documentationId],
    references: [documentationLinks.id],
  }),
  user: one(users, {
    fields: [approvedDocumentation.approvedBy],
    references: [users.id],
  }),
}));

export const checklistTemplatesRelations = relations(checklistTemplates, ({ many }) => ({
  items: many(checklistItemsTemplate),
}));

export const checklistItemsTemplateRelations = relations(checklistItemsTemplate, ({ one }) => ({
  template: one(checklistTemplates, {
    fields: [checklistItemsTemplate.templateId],
    references: [checklistTemplates.id],
  }),
}));

export const optionCatalogsRelations = relations(optionCatalogs, ({ one, many }) => ({
  user: one(users, {
    fields: [optionCatalogs.userId],
    references: [users.id],
  }),
  values: many(optionValues),
}));

export const optionValuesRelations = relations(optionValues, ({ one }) => ({
  catalog: one(optionCatalogs, {
    fields: [optionValues.catalogId],
    references: [optionCatalogs.id],
  }),
}));

export const nacAssessmentsRelations = relations(nacAssessments, ({ one }) => ({
  session: one(scopingSessions, {
    fields: [nacAssessments.sessionId],
    references: [scopingSessions.id],
  }),
}));

export const projectMilestonesRelations = relations(projectMilestones, ({ one, many }) => ({
  session: one(scopingSessions, {
    fields: [projectMilestones.sessionId],
    references: [scopingSessions.id],
  }),
  tasks: many(milestoneTasks),
}));

export const milestoneTasksRelations = relations(milestoneTasks, ({ one }) => ({
  milestone: one(projectMilestones, {
    fields: [milestoneTasks.milestoneId],
    references: [projectMilestones.id],
  }),
}));

// ============================================================================
// INSERT SCHEMAS AND TYPES
// ============================================================================

// Customer Profile
export const insertCustomerProfileSchema = createInsertSchema(customerProfiles).omit({
  id: true,
  userId: true,  // userId is added server-side, not from request
  createdAt: true,
  updatedAt: true,
});
export type InsertCustomerProfile = z.infer<typeof insertCustomerProfileSchema>;
export type CustomerProfile = typeof customerProfiles.$inferSelect;

// Scoping Session
export const insertScopingSessionSchema = createInsertSchema(scopingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});
export type InsertScopingSession = z.infer<typeof insertScopingSessionSchema>;
export type ScopingSession = typeof scopingSessions.$inferSelect;

// Questionnaire Response
export const insertQuestionnaireResponseSchema = createInsertSchema(questionnaireResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertQuestionnaireResponse = z.infer<typeof insertQuestionnaireResponseSchema>;
export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;

// Documentation Link
export const insertDocumentationLinkSchema = createInsertSchema(documentationLinks).omit({
  id: true,
  lastUpdated: true,
});
export type InsertDocumentationLink = z.infer<typeof insertDocumentationLinkSchema>;
export type DocumentationLink = typeof documentationLinks.$inferSelect;

// Deployment Checklist
export const insertDeploymentChecklistSchema = createInsertSchema(deploymentChecklists).omit({
  id: true,
  createdAt: true,
});
export type InsertDeploymentChecklist = z.infer<typeof insertDeploymentChecklistSchema>;
export type DeploymentChecklist = typeof deploymentChecklists.$inferSelect;

// Approved Documentation
export const insertApprovedDocumentationSchema = createInsertSchema(approvedDocumentation).omit({
  id: true,
  approvedAt: true,
});
export type InsertApprovedDocumentation = z.infer<typeof insertApprovedDocumentationSchema>;
export type ApprovedDocumentation = typeof approvedDocumentation.$inferSelect;

// App Settings
export const insertAppSettingSchema = createInsertSchema(appSettings).omit({
  id: true,
  updatedAt: true,
});
export type InsertAppSetting = z.infer<typeof insertAppSettingSchema>;
export type AppSetting = typeof appSettings.$inferSelect;

// Checklist Template
export const insertChecklistTemplateSchema = createInsertSchema(checklistTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertChecklistTemplate = z.infer<typeof insertChecklistTemplateSchema>;
export type ChecklistTemplate = typeof checklistTemplates.$inferSelect;

// Checklist Item Template
export const insertChecklistItemTemplateSchema = createInsertSchema(checklistItemsTemplate).omit({
  id: true,
  createdAt: true,
});
export type InsertChecklistItemTemplate = z.infer<typeof insertChecklistItemTemplateSchema>;
export type ChecklistItemTemplate = typeof checklistItemsTemplate.$inferSelect;

// Option Catalog
export const insertOptionCatalogSchema = createInsertSchema(optionCatalogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOptionCatalog = z.infer<typeof insertOptionCatalogSchema>;
export type OptionCatalog = typeof optionCatalogs.$inferSelect;

// Option Value
export const insertOptionValueSchema = createInsertSchema(optionValues).omit({
  id: true,
  createdAt: true,
});
export type InsertOptionValue = z.infer<typeof insertOptionValueSchema>;
export type OptionValue = typeof optionValues.$inferSelect;

// NAC Assessment
export const insertNacAssessmentSchema = createInsertSchema(nacAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNacAssessment = z.infer<typeof insertNacAssessmentSchema>;
export type NacAssessment = typeof nacAssessments.$inferSelect;

// Project Milestone
export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;

// Milestone Task
export const insertMilestoneTaskSchema = createInsertSchema(milestoneTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMilestoneTask = z.infer<typeof insertMilestoneTaskSchema>;
export type MilestoneTask = typeof milestoneTasks.$inferSelect;
