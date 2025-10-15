import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_shared/storage.js';
import { requireAuth } from './_shared/auth-helper.js';
import { insertCustomerProfileSchema } from '../shared/schema.js';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET' && !req.query.id) {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const includeArchived = req.query.includeArchived === 'true';
      const customers = await storage.listCustomers(userId, includeArchived);
      return res.json(customers);
    }

    if (req.method === 'GET' && req.query.id) {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const customer = await storage.getCustomer(req.query.id as string);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      return res.json(customer);
    }

    if (req.method === 'POST') {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const validated = insertCustomerProfileSchema.parse(req.body);
      
      const customer = await storage.createCustomer({
        ...validated,
        userId,
      });
      
      return res.status(201).json(customer);
    }

    if (req.method === 'PUT' && req.query.id) {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const customer = await storage.getCustomer(req.query.id as string);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validated = insertCustomerProfileSchema.partial().parse(req.body);
      const updated = await storage.updateCustomer(req.query.id as string, validated);
      
      return res.json(updated);
    }

    if (req.method === 'DELETE' && req.query.id) {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const customer = await storage.getCustomer(req.query.id as string);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      if (customer.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCustomer(req.query.id as string);
      return res.status(204).end();
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error('Error in /api/customers:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
