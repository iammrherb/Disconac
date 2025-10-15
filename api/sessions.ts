import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_shared/storage.js';
import { requireAuth } from './_shared/auth-helper.js';
import { insertScopingSessionSchema } from '../shared/schema.js';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET' && !req.query.id) {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const includeArchived = req.query.includeArchived === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const sessions = await storage.listSessions(userId, includeArchived, limit);
      return res.json(sessions);
    }

    if (req.method === 'GET' && req.query.id) {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const session = await storage.getSession(req.query.id as string);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return res.json(session);
    }

    if (req.method === 'POST') {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const validated = insertScopingSessionSchema.parse(req.body);

      const customer = await storage.getCustomer(validated.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const session = await storage.createSession(validated);
      return res.status(201).json(session);
    }

    if (req.method === 'PUT' && req.query.id) {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const session = await storage.getSession(req.query.id as string);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const validated = insertScopingSessionSchema.partial().parse(req.body);
      const updated = await storage.updateSession(req.query.id as string, validated);

      return res.json(updated);
    }

    if (req.method === 'DELETE' && req.query.id) {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const session = await storage.getSession(req.query.id as string);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const customer = await storage.getCustomer(session.customerId);
      if (!customer || customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteSession(req.query.id as string);
      return res.status(204).end();
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error('Error in /api/sessions:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
