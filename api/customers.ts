import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from './_shared/db-client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const customers = await query('SELECT * FROM customer_profiles ORDER BY "createdAt" DESC');
      return res.json(customers);
    }

    if (req.method === 'POST') {
      const { companyName, industry, companySize, region, contactName, contactEmail, contactPhone, notes } = req.body;
      
      const customer = await queryOne(
        `INSERT INTO customer_profiles 
         ("companyName", industry, "companySize", region, "contactName", "contactEmail", "contactPhone", notes, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [companyName, industry || null, companySize || null, region || null, contactName || null, contactEmail || null, contactPhone || null, notes || null]
      );

      return res.status(201).json(customer);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/customers:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
