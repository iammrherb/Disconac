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

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  customerProfiles: many(customerProfiles),
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

// ============================================================================
// INSERT SCHEMAS AND TYPES
// ============================================================================

// Customer Profile
export const insertCustomerProfileSchema = createInsertSchema(customerProfiles).omit({
  id: true,
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
