// API routes for the Portnox Scoping application
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCustomerProfileSchema,
  insertScopingSessionSchema,
  insertQuestionnaireResponseSchema,
  insertDocumentationLinkSchema,
  insertDeploymentChecklistSchema 
} from "@shared/schema";

// Temporary test user ID (no authentication)
const TEST_USER_ID = "test-user-123";

export async function registerRoutes(app: Express): Promise<Server> {

  // ========== Auth Routes (disabled - no authentication) ==========
  
  app.get('/api/auth/user', async (req: any, res) => {
    // Return a test user since auth is disabled
    res.json({
      id: TEST_USER_ID,
      email: "test@portnox.com",
      name: "Test User",
      imageUrl: null
    });
  });

  // ========== Customer Routes ==========
  
  app.get('/api/customers', async (req: any, res) => {
    try {
      const userId = TEST_USER_ID;
      const customers = await storage.getCustomersByUserId(userId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', async (req: any, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Verify ownership
      const userId = TEST_USER_ID;
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
      const userId = TEST_USER_ID;
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
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Verify ownership
      const userId = TEST_USER_ID;
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
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Verify ownership
      const userId = TEST_USER_ID;
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

  // ========== Scoping Session Routes ==========
  
  app.get('/api/sessions', async (req: any, res) => {
    try {
      const userId = TEST_USER_ID;
      const sessions = await storage.getSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get('/api/sessions/recent', async (req: any, res) => {
    try {
      const userId = TEST_USER_ID;
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
      
      const userId = TEST_USER_ID;
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
      const userId = TEST_USER_ID;
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
      
      const userId = TEST_USER_ID;
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
      
      const userId = TEST_USER_ID;
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
      
      const userId = TEST_USER_ID;
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
      
      const userId = TEST_USER_ID;
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
      
      const userId = TEST_USER_ID;
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
      
      const userId = TEST_USER_ID;
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
      const userId = TEST_USER_ID;
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
      
      const userId = TEST_USER_ID;
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

  const httpServer = createServer(app);
  return httpServer;
}
