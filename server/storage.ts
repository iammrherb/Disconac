// Storage interface and implementation using PostgreSQL
import {
  users,
  customerProfiles,
  scopingSessions,
  questionnaireResponses,
  documentationLinks,
  deploymentChecklists,
  appSettings,
  checklistTemplates,
  checklistItemsTemplate,
  optionCatalogs,
  optionValues,
  nacAssessments,
  projectMilestones,
  milestoneTasks,
  type User,
  type UpsertUser,
  type CustomerProfile,
  type InsertCustomerProfile,
  type ScopingSession,
  type InsertScopingSession,
  type QuestionnaireResponse,
  type InsertQuestionnaireResponse,
  type DocumentationLink,
  type InsertDocumentationLink,
  type DeploymentChecklist,
  type InsertDeploymentChecklist,
  type AppSetting,
  type InsertAppSetting,
  type ChecklistTemplate,
  type InsertChecklistTemplate,
  type ChecklistItemTemplate,
  type InsertChecklistItemTemplate,
  type OptionCatalog,
  type InsertOptionCatalog,
  type OptionValue,
  type InsertOptionValue,
  type NacAssessment,
  type InsertNacAssessment,
  type ProjectMilestone,
  type InsertProjectMilestone,
  type MilestoneTask,
  type InsertMilestoneTask,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Storage interface defining all operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Customer operations
  getCustomersByUserId(userId: string): Promise<CustomerProfile[]>;
  getCustomer(id: string): Promise<CustomerProfile | undefined>;
  createCustomer(customer: Omit<InsertCustomerProfile, "id">): Promise<CustomerProfile>;
  updateCustomer(id: string, data: Partial<InsertCustomerProfile>): Promise<CustomerProfile | undefined>;
  deleteCustomer(id: string): Promise<void>;
  
  // Scoping session operations
  getSessionsByCustomerId(customerId: string): Promise<ScopingSession[]>;
  getSessionsByUserId(userId: string): Promise<ScopingSession[]>;
  getRecentSessionsByUserId(userId: string, limit: number): Promise<ScopingSession[]>;
  getSession(id: string): Promise<ScopingSession | undefined>;
  createSession(session: Omit<InsertScopingSession, "id">): Promise<ScopingSession>;
  updateSession(id: string, data: Partial<InsertScopingSession>): Promise<ScopingSession | undefined>;
  deleteSession(id: string): Promise<void>;
  
  // Questionnaire response operations
  getResponsesBySessionId(sessionId: string): Promise<QuestionnaireResponse[]>;
  createResponse(response: Omit<InsertQuestionnaireResponse, "id">): Promise<QuestionnaireResponse>;
  updateResponse(id: string, data: Partial<InsertQuestionnaireResponse>): Promise<QuestionnaireResponse | undefined>;
  bulkUpsertResponses(sessionId: string, responses: Omit<InsertQuestionnaireResponse, "id" | "sessionId">[]): Promise<void>;
  
  // Documentation operations
  getAllDocumentation(): Promise<DocumentationLink[]>;
  searchDocumentation(query: string): Promise<DocumentationLink[]>;
  createDocumentation(doc: Omit<InsertDocumentationLink, "id">): Promise<DocumentationLink>;
  bulkCreateDocumentation(docs: Omit<InsertDocumentationLink, "id">[]): Promise<void>;
  
  // Deployment checklist operations
  getChecklistBySessionId(sessionId: string): Promise<DeploymentChecklist[]>;
  createChecklistItem(item: Omit<InsertDeploymentChecklist, "id">): Promise<DeploymentChecklist>;
  updateChecklistItem(id: string, data: Partial<InsertDeploymentChecklist>): Promise<DeploymentChecklist | undefined>;
  deleteChecklistItem(id: string): Promise<void>;
  
  // Stats operations
  getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalCustomers: number;
    completedSessions: number;
    draftSessions: number;
  }>;

  // Checklist template operations
  getAllTemplates(): Promise<ChecklistTemplate[]>;
  getTemplate(id: string): Promise<ChecklistTemplate | undefined>;
  createTemplate(template: Omit<InsertChecklistTemplate, "id">): Promise<ChecklistTemplate>;
  updateTemplate(id: string, data: Partial<InsertChecklistTemplate>): Promise<ChecklistTemplate | undefined>;
  deleteTemplate(id: string): Promise<void>;
  
  // Checklist template item operations
  getTemplateItems(templateId: string): Promise<ChecklistItemTemplate[]>;
  createTemplateItem(item: Omit<InsertChecklistItemTemplate, "id">): Promise<ChecklistItemTemplate>;
  updateTemplateItem(id: string, data: Partial<InsertChecklistItemTemplate>): Promise<ChecklistItemTemplate | undefined>;
  deleteTemplateItem(id: string): Promise<void>;
  
  // Option catalog operations
  getUserCatalogs(userId: string): Promise<OptionCatalog[]>;
  getCatalog(id: string): Promise<OptionCatalog | undefined>;
  getCatalogByType(userId: string, catalogType: string): Promise<OptionCatalog | undefined>;
  createCatalog(catalog: Omit<InsertOptionCatalog, "id">): Promise<OptionCatalog>;
  updateCatalog(id: string, data: Partial<InsertOptionCatalog>): Promise<OptionCatalog | undefined>;
  deleteCatalog(id: string): Promise<void>;
  
  // Option value operations
  getCatalogValues(catalogId: string): Promise<OptionValue[]>;
  createCatalogValue(value: Omit<InsertOptionValue, "id">): Promise<OptionValue>;
  updateCatalogValue(id: string, data: Partial<InsertOptionValue>): Promise<OptionValue | undefined>;
  deleteCatalogValue(id: string): Promise<void>;
  
  // NAC assessment operations
  getAssessmentBySessionId(sessionId: string): Promise<NacAssessment | undefined>;
  createAssessment(assessment: Omit<InsertNacAssessment, "id">): Promise<NacAssessment>;
  updateAssessment(id: string, data: Partial<InsertNacAssessment>): Promise<NacAssessment | undefined>;
  
  // Project milestone operations
  getMilestonesBySessionId(sessionId: string): Promise<ProjectMilestone[]>;
  createMilestone(milestone: Omit<InsertProjectMilestone, "id">): Promise<ProjectMilestone>;
  updateMilestone(id: string, data: Partial<InsertProjectMilestone>): Promise<ProjectMilestone | undefined>;
  deleteMilestone(id: string): Promise<void>;
  
  // Milestone task operations
  getTasksByMilestoneId(milestoneId: string): Promise<MilestoneTask[]>;
  createMilestoneTask(task: Omit<InsertMilestoneTask, "id">): Promise<MilestoneTask>;
  updateMilestoneTask(id: string, data: Partial<InsertMilestoneTask>): Promise<MilestoneTask | undefined>;
  deleteMilestoneTask(id: string): Promise<void>;

  // Settings operations
  getSetting(key: string): Promise<AppSetting | undefined>;
  upsertSetting(key: string, value: string): Promise<AppSetting>;
  deleteSetting(key: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ========== User Operations ==========
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // ========== Customer Operations ==========
  
  async getCustomersByUserId(userId: string): Promise<CustomerProfile[]> {
    return await db.select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId))
      .orderBy(desc(customerProfiles.createdAt));
  }

  async getCustomer(id: string): Promise<CustomerProfile | undefined> {
    const [customer] = await db.select()
      .from(customerProfiles)
      .where(eq(customerProfiles.id, id));
    return customer;
  }

  async createCustomer(customer: Omit<InsertCustomerProfile, "id"> & { userId: string }): Promise<CustomerProfile> {
    const [newCustomer] = await db
      .insert(customerProfiles)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: string, data: Partial<InsertCustomerProfile>): Promise<CustomerProfile | undefined> {
    const [updated] = await db
      .update(customerProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customerProfiles.id, id))
      .returning();
    return updated;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customerProfiles).where(eq(customerProfiles.id, id));
  }

  // ========== Scoping Session Operations ==========
  
  async getSessionsByCustomerId(customerId: string): Promise<ScopingSession[]> {
    return await db.select()
      .from(scopingSessions)
      .where(eq(scopingSessions.customerId, customerId))
      .orderBy(desc(scopingSessions.createdAt));
  }

  async getSessionsByUserId(userId: string): Promise<ScopingSession[]> {
    // Join with customer profiles to filter by userId
    return await db.select({
      id: scopingSessions.id,
      customerId: scopingSessions.customerId,
      sessionName: scopingSessions.sessionName,
      version: scopingSessions.version,
      status: scopingSessions.status,
      completedAt: scopingSessions.completedAt,
      createdAt: scopingSessions.createdAt,
      updatedAt: scopingSessions.updatedAt,
    })
      .from(scopingSessions)
      .innerJoin(customerProfiles, eq(scopingSessions.customerId, customerProfiles.id))
      .where(eq(customerProfiles.userId, userId))
      .orderBy(desc(scopingSessions.createdAt));
  }

  async getRecentSessionsByUserId(userId: string, limit: number): Promise<ScopingSession[]> {
    return await db.select({
      id: scopingSessions.id,
      customerId: scopingSessions.customerId,
      sessionName: scopingSessions.sessionName,
      version: scopingSessions.version,
      status: scopingSessions.status,
      completedAt: scopingSessions.completedAt,
      createdAt: scopingSessions.createdAt,
      updatedAt: scopingSessions.updatedAt,
    })
      .from(scopingSessions)
      .innerJoin(customerProfiles, eq(scopingSessions.customerId, customerProfiles.id))
      .where(eq(customerProfiles.userId, userId))
      .orderBy(desc(scopingSessions.createdAt))
      .limit(limit);
  }

  async getSession(id: string): Promise<ScopingSession | undefined> {
    const [session] = await db.select()
      .from(scopingSessions)
      .where(eq(scopingSessions.id, id));
    return session;
  }

  async createSession(session: Omit<InsertScopingSession, "id">): Promise<ScopingSession> {
    const [newSession] = await db
      .insert(scopingSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateSession(id: string, data: Partial<InsertScopingSession>): Promise<ScopingSession | undefined> {
    const [updated] = await db
      .update(scopingSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scopingSessions.id, id))
      .returning();
    return updated;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(scopingSessions).where(eq(scopingSessions.id, id));
  }

  // ========== Questionnaire Response Operations ==========
  
  async getResponsesBySessionId(sessionId: string): Promise<QuestionnaireResponse[]> {
    return await db.select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.sessionId, sessionId))
      .orderBy(questionnaireResponses.createdAt);
  }

  async createResponse(response: Omit<InsertQuestionnaireResponse, "id">): Promise<QuestionnaireResponse> {
    const [newResponse] = await db
      .insert(questionnaireResponses)
      .values(response)
      .returning();
    return newResponse;
  }

  async updateResponse(id: string, data: Partial<InsertQuestionnaireResponse>): Promise<QuestionnaireResponse | undefined> {
    const [updated] = await db
      .update(questionnaireResponses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(questionnaireResponses.id, id))
      .returning();
    return updated;
  }

  async bulkUpsertResponses(sessionId: string, responses: Omit<InsertQuestionnaireResponse, "id" | "sessionId">[]): Promise<void> {
    // Delete existing responses for this session
    await db.delete(questionnaireResponses).where(eq(questionnaireResponses.sessionId, sessionId));
    
    // Insert new responses
    if (responses.length > 0) {
      await db.insert(questionnaireResponses).values(
        responses.map(r => ({ ...r, sessionId }))
      );
    }
  }

  // ========== Documentation Operations ==========
  
  async getAllDocumentation(): Promise<DocumentationLink[]> {
    return await db.select()
      .from(documentationLinks)
      .orderBy(documentationLinks.title);
  }

  async searchDocumentation(query: string): Promise<DocumentationLink[]> {
    // Simple search implementation - can be enhanced with full-text search
    return await db.select()
      .from(documentationLinks)
      .orderBy(documentationLinks.title);
  }

  async createDocumentation(doc: Omit<InsertDocumentationLink, "id">): Promise<DocumentationLink> {
    const [newDoc] = await db
      .insert(documentationLinks)
      .values(doc)
      .returning();
    return newDoc;
  }

  async bulkCreateDocumentation(docs: Omit<InsertDocumentationLink, "id">[]): Promise<void> {
    if (docs.length > 0) {
      await db.insert(documentationLinks)
        .values(docs)
        .onConflictDoNothing();
    }
  }

  async updateDocumentation(id: string, data: Partial<InsertDocumentationLink>): Promise<DocumentationLink | undefined> {
    const [updated] = await db
      .update(documentationLinks)
      .set({ ...data, lastUpdated: new Date() })
      .where(eq(documentationLinks.id, id))
      .returning();
    return updated;
  }

  async deleteDocumentation(id: string): Promise<void> {
    await db.delete(documentationLinks).where(eq(documentationLinks.id, id));
  }

  async findDuplicateDocumentation(): Promise<{ url: string; count: number; ids: string[] }[]> {
    const allDocs = await db.select().from(documentationLinks);
    const urlMap = new Map<string, { count: number; ids: string[] }>();
    
    allDocs.forEach(doc => {
      const normalizedUrl = doc.url.trim().toLowerCase();
      if (urlMap.has(normalizedUrl)) {
        const entry = urlMap.get(normalizedUrl)!;
        entry.count++;
        entry.ids.push(doc.id);
      } else {
        urlMap.set(normalizedUrl, { count: 1, ids: [doc.id] });
      }
    });
    
    const duplicates = Array.from(urlMap.entries())
      .filter(([_, data]) => data.count > 1)
      .map(([url, data]) => ({ url, ...data }));
    
    return duplicates;
  }

  async upsertDocumentationByUrl(doc: Omit<InsertDocumentationLink, "id">): Promise<DocumentationLink> {
    const [upserted] = await db
      .insert(documentationLinks)
      .values(doc)
      .onConflictDoUpdate({
        target: documentationLinks.url,
        set: { 
          title: doc.title,
          content: doc.content,
          category: doc.category,
          tags: doc.tags,
          lastUpdated: new Date(),
        },
      })
      .returning();
    return upserted;
  }

  // ========== Deployment Checklist Operations ==========
  
  async getChecklistBySessionId(sessionId: string): Promise<DeploymentChecklist[]> {
    return await db.select()
      .from(deploymentChecklists)
      .where(eq(deploymentChecklists.sessionId, sessionId))
      .orderBy(deploymentChecklists.createdAt);
  }

  async createChecklistItem(item: Omit<InsertDeploymentChecklist, "id">): Promise<DeploymentChecklist> {
    const [newItem] = await db
      .insert(deploymentChecklists)
      .values(item)
      .returning();
    return newItem;
  }

  async updateChecklistItem(id: string, data: Partial<InsertDeploymentChecklist>): Promise<DeploymentChecklist | undefined> {
    const [updated] = await db
      .update(deploymentChecklists)
      .set(data)
      .where(eq(deploymentChecklists.id, id))
      .returning();
    return updated;
  }

  async deleteChecklistItem(id: string): Promise<void> {
    await db.delete(deploymentChecklists).where(eq(deploymentChecklists.id, id));
  }

  // ========== Stats Operations ==========
  
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalCustomers: number;
    completedSessions: number;
    draftSessions: number;
  }> {
    const customers = await this.getCustomersByUserId(userId);
    const sessions = await this.getSessionsByUserId(userId);
    
    return {
      totalSessions: sessions.length,
      totalCustomers: customers.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      draftSessions: sessions.filter(s => s.status === 'draft' || s.status === 'in_progress').length,
    };
  }

  // ========== App Settings Operations ==========
  
  async getAllSettings(): Promise<AppSetting[]> {
    return await db.select().from(appSettings);
  }

  async getSetting(key: string): Promise<AppSetting | undefined> {
    const [setting] = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, key));
    return setting;
  }

  async setSetting(data: InsertAppSetting): Promise<AppSetting> {
    const [setting] = await db
      .insert(appSettings)
      .values(data)
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value: data.value, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }

  async upsertSetting(key: string, value: string): Promise<AppSetting> {
    const [setting] = await db
      .insert(appSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }

  async deleteSetting(key: string): Promise<void> {
    await db.delete(appSettings).where(eq(appSettings.key, key));
  }

  // ========== Checklist Template Operations ==========
  
  async getAllTemplates(): Promise<ChecklistTemplate[]> {
    return await db.select().from(checklistTemplates);
  }

  async getTemplate(id: string): Promise<ChecklistTemplate | undefined> {
    const [template] = await db.select()
      .from(checklistTemplates)
      .where(eq(checklistTemplates.id, id));
    return template;
  }

  async createTemplate(template: Omit<InsertChecklistTemplate, "id">): Promise<ChecklistTemplate> {
    const [newTemplate] = await db
      .insert(checklistTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updateTemplate(id: string, data: Partial<InsertChecklistTemplate>): Promise<ChecklistTemplate | undefined> {
    const [updated] = await db
      .update(checklistTemplates)
      .set(data)
      .where(eq(checklistTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteTemplate(id: string): Promise<void> {
    await db.delete(checklistTemplates).where(eq(checklistTemplates.id, id));
  }

  // ========== Checklist Template Item Operations ==========
  
  async getTemplateItems(templateId: string): Promise<ChecklistItemTemplate[]> {
    return await db.select()
      .from(checklistItemsTemplate)
      .where(eq(checklistItemsTemplate.templateId, templateId))
      .orderBy(checklistItemsTemplate.sortOrder);
  }

  async createTemplateItem(item: Omit<InsertChecklistItemTemplate, "id">): Promise<ChecklistItemTemplate> {
    const [newItem] = await db
      .insert(checklistItemsTemplate)
      .values(item)
      .returning();
    return newItem;
  }

  async updateTemplateItem(id: string, data: Partial<InsertChecklistItemTemplate>): Promise<ChecklistItemTemplate | undefined> {
    const [updated] = await db
      .update(checklistItemsTemplate)
      .set(data)
      .where(eq(checklistItemsTemplate.id, id))
      .returning();
    return updated;
  }

  async deleteTemplateItem(id: string): Promise<void> {
    await db.delete(checklistItemsTemplate).where(eq(checklistItemsTemplate.id, id));
  }

  // ========== Option Catalog Operations ==========
  
  async getUserCatalogs(userId: string): Promise<OptionCatalog[]> {
    return await db.select()
      .from(optionCatalogs)
      .where(eq(optionCatalogs.userId, userId));
  }

  async getCatalog(id: string): Promise<OptionCatalog | undefined> {
    const [catalog] = await db.select()
      .from(optionCatalogs)
      .where(eq(optionCatalogs.id, id));
    return catalog;
  }

  async getCatalogByType(userId: string, catalogType: string): Promise<OptionCatalog | undefined> {
    const [catalog] = await db.select()
      .from(optionCatalogs)
      .where(and(
        eq(optionCatalogs.userId, userId),
        eq(optionCatalogs.type, catalogType)
      ));
    return catalog;
  }

  async createCatalog(catalog: Omit<InsertOptionCatalog, "id">): Promise<OptionCatalog> {
    const [newCatalog] = await db
      .insert(optionCatalogs)
      .values(catalog)
      .returning();
    return newCatalog;
  }

  async updateCatalog(id: string, data: Partial<InsertOptionCatalog>): Promise<OptionCatalog | undefined> {
    const [updated] = await db
      .update(optionCatalogs)
      .set(data)
      .where(eq(optionCatalogs.id, id))
      .returning();
    return updated;
  }

  async deleteCatalog(id: string): Promise<void> {
    await db.delete(optionCatalogs).where(eq(optionCatalogs.id, id));
  }

  // ========== Option Value Operations ==========
  
  async getCatalogValues(catalogId: string): Promise<OptionValue[]> {
    return await db.select()
      .from(optionValues)
      .where(eq(optionValues.catalogId, catalogId))
      .orderBy(optionValues.sortOrder);
  }

  async createCatalogValue(value: Omit<InsertOptionValue, "id">): Promise<OptionValue> {
    const [newValue] = await db
      .insert(optionValues)
      .values(value)
      .returning();
    return newValue;
  }

  async updateCatalogValue(id: string, data: Partial<InsertOptionValue>): Promise<OptionValue | undefined> {
    const [updated] = await db
      .update(optionValues)
      .set(data)
      .where(eq(optionValues.id, id))
      .returning();
    return updated;
  }

  async deleteCatalogValue(id: string): Promise<void> {
    await db.delete(optionValues).where(eq(optionValues.id, id));
  }

  // ========== NAC Assessment Operations ==========
  
  async getAssessmentBySessionId(sessionId: string): Promise<NacAssessment | undefined> {
    const [assessment] = await db.select()
      .from(nacAssessments)
      .where(eq(nacAssessments.sessionId, sessionId));
    return assessment;
  }

  async createAssessment(assessment: Omit<InsertNacAssessment, "id">): Promise<NacAssessment> {
    const [newAssessment] = await db
      .insert(nacAssessments)
      .values(assessment)
      .returning();
    return newAssessment;
  }

  async updateAssessment(id: string, data: Partial<InsertNacAssessment>): Promise<NacAssessment | undefined> {
    const [updated] = await db
      .update(nacAssessments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(nacAssessments.id, id))
      .returning();
    return updated;
  }

  // ========== Project Milestone Operations ==========
  
  async getMilestonesBySessionId(sessionId: string): Promise<ProjectMilestone[]> {
    return await db.select()
      .from(projectMilestones)
      .where(eq(projectMilestones.sessionId, sessionId))
      .orderBy(projectMilestones.sortOrder);
  }

  async createMilestone(milestone: Omit<InsertProjectMilestone, "id">): Promise<ProjectMilestone> {
    const [newMilestone] = await db
      .insert(projectMilestones)
      .values(milestone)
      .returning();
    return newMilestone;
  }

  async updateMilestone(id: string, data: Partial<InsertProjectMilestone>): Promise<ProjectMilestone | undefined> {
    const [updated] = await db
      .update(projectMilestones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projectMilestones.id, id))
      .returning();
    return updated;
  }

  async deleteMilestone(id: string): Promise<void> {
    await db.delete(projectMilestones).where(eq(projectMilestones.id, id));
  }

  // ========== Milestone Task Operations ==========
  
  async getTasksByMilestoneId(milestoneId: string): Promise<MilestoneTask[]> {
    return await db.select()
      .from(milestoneTasks)
      .where(eq(milestoneTasks.milestoneId, milestoneId))
      .orderBy(milestoneTasks.sortOrder);
  }

  async createMilestoneTask(task: Omit<InsertMilestoneTask, "id">): Promise<MilestoneTask> {
    const [newTask] = await db
      .insert(milestoneTasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateMilestoneTask(id: string, data: Partial<InsertMilestoneTask>): Promise<MilestoneTask | undefined> {
    const [updated] = await db
      .update(milestoneTasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(milestoneTasks.id, id))
      .returning();
    return updated;
  }

  async deleteMilestoneTask(id: string): Promise<void> {
    await db.delete(milestoneTasks).where(eq(milestoneTasks.id, id));
  }
}

export const storage = new DatabaseStorage();
