// Storage interface and implementation using PostgreSQL
import {
  users,
  customerProfiles,
  scopingSessions,
  questionnaireResponses,
  documentationLinks,
  deploymentChecklists,
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

  async createCustomer(customer: Omit<InsertCustomerProfile, "id">): Promise<CustomerProfile> {
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
}

export const storage = new DatabaseStorage();
