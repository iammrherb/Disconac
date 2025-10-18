// API routes for the Portnox Scoping application
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { z } from "zod";
import { 
  insertCustomerProfileSchema,
  insertScopingSessionSchema,
  insertQuestionnaireResponseSchema,
  insertDocumentationLinkSchema,
  insertDeploymentChecklistSchema,
  insertApprovedDocumentationSchema,
  insertChecklistTemplateSchema,
  insertChecklistItemTemplateSchema,
  insertOptionCatalogSchema,
  insertOptionValueSchema,
  insertNacAssessmentSchema,
  insertProjectMilestoneSchema,
  insertMilestoneTaskSchema
} from "../shared/schema.js";
import { 
  generateAIRecommendations, 
  generateBestPractices, 
  generateImplementationGuide,
  generateMigrationRecommendations
} from "./ai-service.js";
import { generatePDF, generateWord } from "./export-service.js";
import { exportWithTemplate, type ExportTemplate } from "./export-templates.js";

// Helper function to get authenticated user ID from request
function getUserId(req: any): string | null {
  if (!req.isAuthenticated() || !req.user) {
    return null;
  }
  const claims = (req.user as any).claims;
  return claims?.sub || null;
}

// Middleware to require authentication and return user ID
function requireAuth(req: any, res: any): string | null {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return userId;
}

export async function registerRoutes(app: Express): Promise<Server> {

  // ========== Auth Routes ==========
  
  app.get('/api/auth/user', async (req: any, res) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl
    });
  });

  // ========== Customer Routes ==========
  
  app.get('/api/customers', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;
      
      const customers = await storage.getCustomersByUserId(userId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Verify ownership
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post('/api/customers', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const validated = insertCustomerProfileSchema.parse(req.body);
      
      const customer = await storage.createCustomer({
        ...validated,
        userId,
      });
      
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put('/api/customers/:id', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Verify ownership
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validated = insertCustomerProfileSchema.partial().parse(req.body);
      const updated = await storage.updateCustomer(req.params.id, validated);
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete('/api/customers/:id', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Verify ownership
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCustomer(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  app.post('/api/customers/:id/archive', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Verify ownership
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.archiveCustomer(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error archiving customer:", error);
      res.status(500).json({ message: "Failed to archive customer" });
    }
  });

  app.post('/api/customers/:id/unarchive', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Verify ownership
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.unarchiveCustomer(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unarchiving customer:", error);
      res.status(500).json({ message: "Failed to unarchive customer" });
    }
  });

  // ========== Scoping Session Routes ==========
  
  app.get('/api/sessions', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;
      const sessions = await storage.getSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get('/api/sessions/recent', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;
      const limit = parseInt(req.query.limit as string) || 5;
      const sessions = await storage.getRecentSessionsByUserId(userId, limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching recent sessions:", error);
      res.status(500).json({ message: "Failed to fetch recent sessions" });
    }
  });

  app.get('/api/sessions/:id', async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify ownership through customer
      const customer = await storage.getCustomer(session.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const userId = requireAuth(req, res);
      if (!userId) return;
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.post('/api/sessions', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;
      const validated = insertScopingSessionSchema.parse(req.body);
      
      // Verify customer ownership
      const customer = await storage.getCustomer(validated.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const session = await storage.createSession(validated);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.put('/api/sessions/:id', async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify ownership
      const customer = await storage.getCustomer(session.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const userId = requireAuth(req, res);
      if (!userId) return;
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validated = insertScopingSessionSchema.partial().parse(req.body);
      const updated = await storage.updateSession(req.params.id, validated);
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.delete('/api/sessions/:id', async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify ownership
      const customer = await storage.getCustomer(session.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const userId = requireAuth(req, res);
      if (!userId) return;
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteSession(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  app.post('/api/sessions/:id/archive', async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify ownership
      const customer = await storage.getCustomer(session.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const userId = requireAuth(req, res);
      if (!userId) return;
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.archiveSession(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error archiving session:", error);
      res.status(500).json({ message: "Failed to archive session" });
    }
  });

  app.post('/api/sessions/:id/unarchive', async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify ownership
      const customer = await storage.getCustomer(session.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const userId = requireAuth(req, res);
      if (!userId) return;
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.unarchiveSession(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unarchiving session:", error);
      res.status(500).json({ message: "Failed to unarchive session" });
    }
  });

  // ========== Questionnaire Response Routes ==========
  
  app.get('/api/sessions/:id/responses', async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify ownership
      const customer = await storage.getCustomer(session.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const userId = requireAuth(req, res);
      if (!userId) return;
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const responses = await storage.getResponsesBySessionId(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  app.put('/api/sessions/:id/responses', async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify ownership
      const customer = await storage.getCustomer(session.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const userId = requireAuth(req, res);
      if (!userId) return;
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Save responses (expecting object, not array)
      const responses = req.body;
      if (typeof responses !== 'object') {
        return res.status(400).json({ message: "Expected object of responses" });
      }
      
      // Convert responses object to array format for storage
      // Field IDs are typically in format: category-fieldName or just fieldName
      const responseArray = Object.entries(responses).map(([questionId, answer]) => {
        // Parse category from questionId if it contains a dash
        const parts = questionId.split('-');
        const category = parts.length > 1 ? parts[0] : 'general';
        const question = parts.length > 1 ? parts.slice(1).join(' ') : questionId;
        
        // Determine response type based on answer format
        let responseType = 'text';
        if (Array.isArray(answer)) {
          responseType = 'multiselect';
        } else if (typeof answer === 'number') {
          responseType = 'number';
        } else if (typeof answer === 'boolean') {
          responseType = 'checkbox';
        }
        
        return {
          category,
          question,
          responseType,
          response: answer as any, // Cast to Json type - answer can be string, number, boolean, array, or object
        };
      });
      
      await storage.bulkUpsertResponses(req.params.id, responseArray);
      
      // Update session status to in_progress if it was draft
      if (session.status === 'draft') {
        await storage.updateSession(req.params.id, { status: 'in_progress' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving responses:", error);
      res.status(500).json({ message: "Failed to save responses" });
    }
  });

  // ========== Documentation Routes ==========
  
  app.get('/api/documentation', async (req: any, res) => {
    try {
      const query = req.query.q as string;
      const docs = query 
        ? await storage.searchDocumentation(query)
        : await storage.getAllDocumentation();
      res.json(docs);
    } catch (error) {
      console.error("Error fetching documentation:", error);
      res.status(500).json({ message: "Failed to fetch documentation" });
    }
  });

  app.post('/api/documentation/import', async (req: any, res) => {
    try {
      const docs = req.body;
      if (!Array.isArray(docs)) {
        return res.status(400).json({ message: "Expected array of documentation" });
      }
      
      await storage.bulkCreateDocumentation(docs);
      res.json({ success: true, count: docs.length });
    } catch (error) {
      console.error("Error importing documentation:", error);
      res.status(500).json({ message: "Failed to import documentation" });
    }
  });

  app.post('/api/documentation', async (req: any, res) => {
    try {
      const validated = insertDocumentationLinkSchema.parse(req.body);
      const newDoc = await storage.createDocumentation(validated);
      res.status(201).json(newDoc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating documentation:", error);
      res.status(500).json({ message: "Failed to create documentation" });
    }
  });

  app.put('/api/documentation/:id', async (req: any, res) => {
    try {
      const validated = insertDocumentationLinkSchema.partial().parse(req.body);
      const updated = await storage.updateDocumentation(req.params.id, validated);
      if (!updated) {
        return res.status(404).json({ message: "Documentation not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating documentation:", error);
      res.status(500).json({ message: "Failed to update documentation" });
    }
  });

  app.delete('/api/documentation/:id', async (req: any, res) => {
    try {
      await storage.deleteDocumentation(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting documentation:", error);
      res.status(500).json({ message: "Failed to delete documentation" });
    }
  });

  app.get('/api/documentation/duplicates', async (req: any, res) => {
    try {
      const duplicates = await storage.findDuplicateDocumentation();
      res.json(duplicates);
    } catch (error) {
      console.error("Error finding duplicates:", error);
      res.status(500).json({ message: "Failed to find duplicates" });
    }
  });

  app.post('/api/documentation/crawl', async (req: any, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Get Firecrawl API key from settings
      const apiKeySetting = await storage.getSetting('firecrawl_api_key');
      if (!apiKeySetting) {
        return res.status(400).json({ message: "Firecrawl API key not configured. Please add it in Settings." });
      }

      // Make API call to Firecrawl
      const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeySetting.value}`,
        },
        body: JSON.stringify({
          url,
          formats: ['markdown', 'html'],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ message: `Firecrawl API error: ${error}` });
      }

      const data = await response.json();
      
      // Extract content and upsert documentation entry (handles duplicates)
      if (data.success && data.data) {
        const newDoc = await storage.upsertDocumentationByUrl({
          url,
          title: data.data.title || url,
          content: data.data.markdown || data.data.html || '',
          category: 'Web Crawled',
          tags: ['firecrawl', 'auto-imported'],
        });
        
        res.json(newDoc);
      } else {
        res.status(500).json({ message: "Failed to extract data from URL" });
      }
    } catch (error) {
      console.error("Error crawling documentation:", error);
      res.status(500).json({ message: "Failed to crawl documentation" });
    }
  });

  app.post('/api/documentation/crawl-multiple', async (req: any, res) => {
    try {
      const { urls } = req.body;
      if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ message: "URLs array is required" });
      }

      const { crawlMultipleUrls } = await import('./firecrawl-service');
      const result = await crawlMultipleUrls(urls, {
        delayMs: 1000,
        maxConcurrent: 3,
      });

      res.json(result);
    } catch (error) {
      console.error("Error crawling multiple URLs:", error);
      res.status(500).json({ message: "Failed to crawl URLs" });
    }
  });

  app.post('/api/documentation/crawl-all-portnox', async (req: any, res) => {
    try {
      const { crawlAllPortnoxDocs } = await import('./firecrawl-service');
      const options = req.body || {};
      
      const result = await crawlAllPortnoxDocs(options);
      res.json(result);
    } catch (error) {
      console.error("Error crawling all Portnox docs:", error);
      res.status(500).json({ message: "Failed to crawl Portnox documentation" });
    }
  });

  app.get('/api/documentation/crawl-status', async (req: any, res) => {
    try {
      const { getCrawlStatus } = await import('./firecrawl-service');
      const status = await getCrawlStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting crawl status:", error);
      res.status(500).json({ message: "Failed to get crawl status" });
    }
  });

  app.post('/api/documentation/refresh-stale', async (req: any, res) => {
    try {
      const { daysOld = 30 } = req.body;
      const { refreshStaleDocumentation } = await import('./firecrawl-service');
      
      const result = await refreshStaleDocumentation(daysOld);
      res.json(result);
    } catch (error) {
      console.error("Error refreshing stale documentation:", error);
      res.status(500).json({ message: "Failed to refresh stale documentation" });
    }
  });

  // ========== Settings Routes ==========
  
  app.get('/api/settings', async (req: any, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/settings/:key', async (req: any, res) => {
    try {
      const { value, description } = req.body;
      const setting = await storage.setSetting({
        key: req.params.key,
        value,
        description,
      });
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  app.delete('/api/settings/:key', async (req: any, res) => {
    try {
      await storage.deleteSetting(req.params.key);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting setting:", error);
      res.status(500).json({ message: "Failed to delete setting" });
    }
  });

  // ========== Deployment Checklist Routes ==========
  
  app.get('/api/sessions/:id/checklist', async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify ownership
      const customer = await storage.getCustomer(session.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const userId = requireAuth(req, res);
      if (!userId) return;
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const checklist = await storage.getChecklistBySessionId(req.params.id);
      res.json(checklist);
    } catch (error) {
      console.error("Error fetching checklist:", error);
      res.status(500).json({ message: "Failed to fetch checklist" });
    }
  });

  app.post('/api/sessions/:id/checklist', async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify ownership
      const customer = await storage.getCustomer(session.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const userId = requireAuth(req, res);
      if (!userId) return;
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validated = insertDeploymentChecklistSchema.parse(req.body);
      const item = await storage.createChecklistItem({
        ...validated,
        sessionId: req.params.id,
      });
      
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating checklist item:", error);
      res.status(500).json({ message: "Failed to create checklist item" });
    }
  });

  app.put('/api/checklist/:id', async (req: any, res) => {
    try {
      const validated = insertDeploymentChecklistSchema.partial().parse(req.body);
      const updated = await storage.updateChecklistItem(req.params.id, validated);
      
      if (!updated) {
        return res.status(404).json({ message: "Checklist item not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating checklist item:", error);
      res.status(500).json({ message: "Failed to update checklist item" });
    }
  });

  app.delete('/api/checklist/:id', async (req: any, res) => {
    try {
      await storage.deleteChecklistItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting checklist item:", error);
      res.status(500).json({ message: "Failed to delete checklist item" });
    }
  });

  // ========== Stats Routes ==========
  
  app.get('/api/stats', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ========== Recommendation Routes ==========
  
  app.post('/api/sessions/:id/generate-checklist', async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify ownership
      const customer = await storage.getCustomer(session.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const userId = requireAuth(req, res);
      if (!userId) return;
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const responses = req.body;
      const { generateDeploymentChecklist, saveGeneratedChecklist } = await import("./services");
      
      // Generate checklist recommendations
      const recommendations = await generateDeploymentChecklist(req.params.id, responses);
      
      // Save to database
      await saveGeneratedChecklist(req.params.id, recommendations);
      
      res.json({ success: true, recommendations });
    } catch (error) {
      console.error("Error generating checklist:", error);
      res.status(500).json({ message: "Failed to generate checklist" });
    }
  });

  app.post('/api/documentation/recommendations', async (req: any, res) => {
    try {
      const responses = req.body;
      const { getDocumentationRecommendations } = await import("./services");
      
      const recommendations = await getDocumentationRecommendations(responses);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting documentation recommendations:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  // ========== Checklist Template Routes ==========
  
  app.get('/api/templates', async (req: any, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id', async (req: any, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post('/api/templates', async (req: any, res) => {
    try {
      const validated = insertChecklistTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validated);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.put('/api/templates/:id', async (req: any, res) => {
    try {
      const validated = insertChecklistTemplateSchema.partial().parse(req.body);
      const template = await storage.updateTemplate(req.params.id, validated);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete('/api/templates/:id', async (req: any, res) => {
    try {
      await storage.deleteTemplate(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // ========== Template Items Routes ==========
  
  app.get('/api/templates/:templateId/items', async (req: any, res) => {
    try {
      const items = await storage.getTemplateItems(req.params.templateId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching template items:", error);
      res.status(500).json({ message: "Failed to fetch template items" });
    }
  });

  app.post('/api/templates/:templateId/items', async (req: any, res) => {
    try {
      const validated = insertChecklistItemTemplateSchema.parse({
        ...req.body,
        templateId: req.params.templateId
      });
      const item = await storage.createTemplateItem(validated);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating template item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create template item" });
    }
  });

  app.put('/api/template-items/:id', async (req: any, res) => {
    try {
      const validated = insertChecklistItemTemplateSchema.partial().parse(req.body);
      const item = await storage.updateTemplateItem(req.params.id, validated);
      if (!item) {
        return res.status(404).json({ message: "Template item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating template item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update template item" });
    }
  });

  app.delete('/api/template-items/:id', async (req: any, res) => {
    try {
      await storage.deleteTemplateItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template item:", error);
      res.status(500).json({ message: "Failed to delete template item" });
    }
  });

  // ========== Option Catalog Routes ==========
  
  app.get('/api/catalogs', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;
      const catalogs = await storage.getUserCatalogs(userId);
      res.json(catalogs);
    } catch (error) {
      console.error("Error fetching catalogs:", error);
      res.status(500).json({ message: "Failed to fetch catalogs" });
    }
  });

  app.get('/api/catalogs/:id', async (req: any, res) => {
    try {
      const catalog = await storage.getCatalog(req.params.id);
      if (!catalog) {
        return res.status(404).json({ message: "Catalog not found" });
      }
      res.json(catalog);
    } catch (error) {
      console.error("Error fetching catalog:", error);
      res.status(500).json({ message: "Failed to fetch catalog" });
    }
  });

  app.post('/api/catalogs', async (req: any, res) => {
    try {
      const userId = requireAuth(req, res);
      if (!userId) return;
      const validated = insertOptionCatalogSchema.parse({
        ...req.body,
        userId
      });
      const catalog = await storage.createCatalog(validated);
      res.status(201).json(catalog);
    } catch (error) {
      console.error("Error creating catalog:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create catalog" });
    }
  });

  app.put('/api/catalogs/:id', async (req: any, res) => {
    try {
      const validated = insertOptionCatalogSchema.partial().parse(req.body);
      const catalog = await storage.updateCatalog(req.params.id, validated);
      if (!catalog) {
        return res.status(404).json({ message: "Catalog not found" });
      }
      res.json(catalog);
    } catch (error) {
      console.error("Error updating catalog:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update catalog" });
    }
  });

  app.delete('/api/catalogs/:id', async (req: any, res) => {
    try {
      await storage.deleteCatalog(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting catalog:", error);
      res.status(500).json({ message: "Failed to delete catalog" });
    }
  });

  // ========== Option Value Routes ==========
  
  app.get('/api/catalogs/:catalogId/values', async (req: any, res) => {
    try {
      const values = await storage.getCatalogValues(req.params.catalogId);
      res.json(values);
    } catch (error) {
      console.error("Error fetching catalog values:", error);
      res.status(500).json({ message: "Failed to fetch catalog values" });
    }
  });

  app.post('/api/catalogs/:catalogId/values', async (req: any, res) => {
    try {
      const validated = insertOptionValueSchema.parse({
        ...req.body,
        catalogId: req.params.catalogId
      });
      const value = await storage.createCatalogValue(validated);
      res.status(201).json(value);
    } catch (error) {
      console.error("Error creating catalog value:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create catalog value" });
    }
  });

  app.put('/api/catalog-values/:id', async (req: any, res) => {
    try {
      const validated = insertOptionValueSchema.partial().parse(req.body);
      const value = await storage.updateCatalogValue(req.params.id, validated);
      if (!value) {
        return res.status(404).json({ message: "Catalog value not found" });
      }
      res.json(value);
    } catch (error) {
      console.error("Error updating catalog value:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update catalog value" });
    }
  });

  app.delete('/api/catalog-values/:id', async (req: any, res) => {
    try {
      await storage.deleteCatalogValue(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting catalog value:", error);
      res.status(500).json({ message: "Failed to delete catalog value" });
    }
  });

  // ========== NAC Assessment Routes ==========
  
  app.get('/api/sessions/:sessionId/assessment', async (req: any, res) => {
    try {
      const assessment = await storage.getAssessmentBySessionId(req.params.sessionId);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  app.post('/api/sessions/:sessionId/assessment', async (req: any, res) => {
    try {
      const validated = insertNacAssessmentSchema.parse({
        ...req.body,
        sessionId: req.params.sessionId
      });
      const assessment = await storage.createAssessment(validated);
      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  app.put('/api/assessments/:id', async (req: any, res) => {
    try {
      const validated = insertNacAssessmentSchema.partial().parse(req.body);
      const assessment = await storage.updateAssessment(req.params.id, validated);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      console.error("Error updating assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });

  // ========== Project Milestone Routes ==========
  
  app.get('/api/sessions/:sessionId/milestones', async (req: any, res) => {
    try {
      const milestones = await storage.getMilestonesBySessionId(req.params.sessionId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post('/api/sessions/:sessionId/milestones', async (req: any, res) => {
    try {
      const validated = insertProjectMilestoneSchema.parse({
        ...req.body,
        sessionId: req.params.sessionId
      });
      const milestone = await storage.createMilestone(validated);
      res.status(201).json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  app.put('/api/milestones/:id', async (req: any, res) => {
    try {
      const validated = insertProjectMilestoneSchema.partial().parse(req.body);
      const milestone = await storage.updateMilestone(req.params.id, validated);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      res.json(milestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });

  app.delete('/api/milestones/:id', async (req: any, res) => {
    try {
      await storage.deleteMilestone(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  });

  // ========== Milestone Task Routes ==========
  
  app.get('/api/milestones/:milestoneId/tasks', async (req: any, res) => {
    try {
      const tasks = await storage.getTasksByMilestoneId(req.params.milestoneId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/milestones/:milestoneId/tasks', async (req: any, res) => {
    try {
      const validated = insertMilestoneTaskSchema.parse({
        ...req.body,
        milestoneId: req.params.milestoneId
      });
      const task = await storage.createMilestoneTask(validated);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/milestone-tasks/:id', async (req: any, res) => {
    try {
      const validated = insertMilestoneTaskSchema.partial().parse(req.body);
      const task = await storage.updateMilestoneTask(req.params.id, validated);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/milestone-tasks/:id', async (req: any, res) => {
    try {
      await storage.deleteMilestoneTask(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // ========== Approved Documentation Routes ==========
  
  app.get('/api/sessions/:sessionId/approved-docs', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      // Verify session ownership
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: You do not own this session" });
      }

      const approvedDocs = await storage.getApprovedDocsBySessionId(req.params.sessionId);
      res.json(approvedDocs);
    } catch (error) {
      console.error("Error fetching approved docs:", error);
      res.status(500).json({ message: "Failed to fetch approved documentation" });
    }
  });

  app.post('/api/sessions/:sessionId/approved-docs', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      // Verify session ownership
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: You do not own this session" });
      }

      const validated = insertApprovedDocumentationSchema.parse({
        ...req.body,
        sessionId: req.params.sessionId,
        approvedBy: userId
      });
      const approvedDoc = await storage.approveDocumentation(validated);
      res.status(201).json(approvedDoc);
    } catch (error) {
      console.error("Error approving documentation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to approve documentation" });
    }
  });

  app.delete('/api/sessions/:sessionId/approved-docs/:docId', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      // Verify session ownership
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: You do not own this session" });
      }

      await storage.removeApprovedDoc(req.params.sessionId, req.params.docId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing approved doc:", error);
      res.status(500).json({ message: "Failed to remove approved documentation" });
    }
  });

  // ========== AI Recommendation Routes ==========

  app.post('/api/sessions/:sessionId/ai-recommendations', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      // Verify session ownership
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: You do not own this session" });
      }

      // Get questionnaire responses
      const responses = await storage.getResponsesBySessionId(req.params.sessionId);
      
      // Convert responses to questionnaire data format
      const questionnaireData = responses.reduce((acc: Record<string, any>, resp) => {
        acc[resp.question] = resp.response;
        return acc;
      }, {} as Record<string, any>);

      // Generate AI recommendations
      const recommendations = await generateAIRecommendations(
        questionnaireData,
        customer.companyName
      );

      res.json(recommendations);
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      res.status(500).json({ message: "Failed to generate AI recommendations" });
    }
  });

  app.post('/api/sessions/:sessionId/best-practices', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      // Verify session ownership
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: You do not own this session" });
      }

      // Get questionnaire responses
      const responses = await storage.getResponsesBySessionId(req.params.sessionId);
      
      // Convert responses to questionnaire data format
      const questionnaireData = responses.reduce((acc: Record<string, any>, resp) => {
        acc[resp.question] = resp.response;
        return acc;
      }, {} as Record<string, any>);

      // Generate best practices
      const bestPractices = await generateBestPractices(questionnaireData);

      res.json(bestPractices);
    } catch (error) {
      console.error("Error generating best practices:", error);
      res.status(500).json({ message: "Failed to generate best practices" });
    }
  });

  app.post('/api/sessions/:sessionId/implementation-guide', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      // Verify session ownership
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: You do not own this session" });
      }

      // Get questionnaire responses
      const responses = await storage.getResponsesBySessionId(req.params.sessionId);
      
      // Convert responses to questionnaire data format
      const questionnaireData = responses.reduce((acc: Record<string, any>, resp) => {
        acc[resp.question] = resp.response;
        return acc;
      }, {} as Record<string, any>);

      // Generate implementation guide
      const guide = await generateImplementationGuide(
        questionnaireData,
        customer.companyName
      );

      res.json(guide);
    } catch (error) {
      console.error("Error generating implementation guide:", error);
      res.status(500).json({ message: "Failed to generate implementation guide" });
    }
  });

  // ========== Contextual AI Routes ==========
  
  app.post('/api/contextual-suggestions', async (req: any, res) => {
    try {
      const { currentField, currentValue, allResponses } = req.body;
      
      if (!currentField) {
        return res.status(400).json({ message: "currentField is required" });
      }

      const { generateContextualSuggestions } = await import('./ai-contextual-service');
      const suggestions = generateContextualSuggestions(currentField, currentValue, allResponses || {});
      
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating contextual suggestions:", error);
      res.status(500).json({ message: "Failed to generate contextual suggestions" });
    }
  });

  app.post('/api/industry-comparison', async (req: any, res) => {
    try {
      const { responses } = req.body;
      
      if (!responses || typeof responses !== 'object') {
        return res.status(400).json({ message: "responses object is required" });
      }

      const { generateIndustryComparison } = await import('./ai-contextual-service');
      const insights = generateIndustryComparison(responses);
      
      res.json({ insights });
    } catch (error) {
      console.error("Error generating industry comparison:", error);
      res.status(500).json({ message: "Failed to generate industry comparison" });
    }
  });

  app.post('/api/risk-assessment', async (req: any, res) => {
    try {
      const { responses } = req.body;
      
      if (!responses || typeof responses !== 'object') {
        return res.status(400).json({ message: "responses object is required" });
      }

      const { generateRiskAssessment } = await import('./ai-contextual-service');
      const risks = generateRiskAssessment(responses);
      
      res.json({ risks });
    } catch (error) {
      console.error("Error generating risk assessment:", error);
      res.status(500).json({ message: "Failed to generate risk assessment" });
    }
  });

  app.post('/api/timeline-estimate', async (req: any, res) => {
    try {
      const { responses } = req.body;
      
      if (!responses || typeof responses !== 'object') {
        return res.status(400).json({ message: "responses object is required" });
      }

      const { generateTimelineEstimate } = await import('./ai-contextual-service');
      const timeline = generateTimelineEstimate(responses);
      
      res.json({ timeline });
    } catch (error) {
      console.error("Error generating timeline estimate:", error);
      res.status(500).json({ message: "Failed to generate timeline estimate" });
    }
  });

  // ========== Salesforce Integration Routes ==========
  
  app.get('/api/salesforce/test-connection', async (req: any, res) => {
    try {
      const { testSalesforceConnection } = await import('./salesforce-service');
      const result = await testSalesforceConnection();
      res.json(result);
    } catch (error) {
      console.error("Error testing Salesforce connection:", error);
      res.status(500).json({ message: "Failed to test Salesforce connection" });
    }
  });

  app.post('/api/salesforce/sync-customer/:customerId', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const customer = await storage.getCustomer(req.params.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { syncCustomerToSalesforce } = await import('./salesforce-service');
      const result = await syncCustomerToSalesforce(customer);
      
      if (!result) {
        return res.status(500).json({ message: "Failed to sync customer to Salesforce" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error syncing customer to Salesforce:", error);
      res.status(500).json({ message: "Failed to sync customer" });
    }
  });

  app.post('/api/salesforce/sync-session/:sessionId', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const responses = await storage.getResponsesBySessionId(req.params.sessionId);
      const responsesMap = responses.reduce((acc: Record<string, any>, resp) => {
        acc[resp.question] = resp.response;
        return acc;
      }, {});

      const { syncSessionToSalesforce } = await import('./salesforce-service');
      const result = await syncSessionToSalesforce(session, customer, responsesMap);
      
      if (!result) {
        return res.status(500).json({ message: "Failed to sync session to Salesforce" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error syncing session to Salesforce:", error);
      res.status(500).json({ message: "Failed to sync session" });
    }
  });

  // ========== Export Routes ==========

  app.get('/api/sessions/:sessionId/export/pdf', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      // Verify session ownership
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: You do not own this session" });
      }

      // Get all session data
      const responses = await storage.getResponsesBySessionId(req.params.sessionId);
      const checklist = await storage.getChecklistBySessionId(req.params.sessionId);
      const approvedDocs = await storage.getApprovedDocsBySessionId(req.params.sessionId);

      // Generate PDF
      const pdfBuffer = await generatePDF({
        session: { ...session, customer },
        responses,
        checklist,
        recommendedDocs: approvedDocs,
      });

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Portnox-Deployment-Guide-${customer.companyName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  app.get('/api/sessions/:sessionId/export/word', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      // Verify session ownership
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: You do not own this session" });
      }

      // Get all session data
      const responses = await storage.getResponsesBySessionId(req.params.sessionId);
      const checklist = await storage.getChecklistBySessionId(req.params.sessionId);
      const approvedDocs = await storage.getApprovedDocsBySessionId(req.params.sessionId);

      // Generate Word document
      const wordBuffer = await generateWord({
        session: { ...session, customer },
        responses,
        checklist,
        recommendedDocs: approvedDocs,
      });

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="Portnox-Deployment-Guide-${customer.companyName.replace(/[^a-zA-Z0-9]/g, '-')}.docx"`);
      res.send(wordBuffer);
    } catch (error) {
      console.error("Error generating Word document:", error);
      res.status(500).json({ message: "Failed to generate Word document" });
    }
  });

  app.get('/api/sessions/:sessionId/export/:template', async (req: any, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const template = req.params.template as ExportTemplate;
      const validTemplates: ExportTemplate[] = ['comprehensive', 'executive', 'technical', 'checklist-only'];
      
      if (!validTemplates.includes(template)) {
        return res.status(400).json({ message: "Invalid template type" });
      }

      // Verify session ownership
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: You do not own this session" });
      }

      // Get all session data
      const responses = await storage.getResponsesBySessionId(req.params.sessionId);
      const checklist = await storage.getChecklistBySessionId(req.params.sessionId);
      const approvedDocs = await storage.getApprovedDocsBySessionId(req.params.sessionId);

      // Generate export with template
      const exportBuffer = await exportWithTemplate({
        session: { ...session, customer },
        responses,
        checklist,
        recommendedDocs: approvedDocs,
      }, template);

      // Determine filename based on template
      const templateNames = {
        'executive': 'Executive-Summary',
        'technical': 'Technical-Deep-Dive',
        'checklist-only': 'Checklist',
        'comprehensive': 'Deployment-Guide'
      };
      const templateName = templateNames[template] || 'Export';
      const filename = `Portnox-${templateName}-${customer.companyName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportBuffer);
    } catch (error) {
      console.error("Error generating export:", error);
      res.status(500).json({ message: "Failed to generate export" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
