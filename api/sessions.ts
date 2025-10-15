import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from './_shared/db-client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const sessions = await query(
        `SELECT s.*, c."companyName" 
         FROM scoping_sessions s 
         LEFT JOIN customer_profiles c ON s."customerId" = c.id 
         ORDER BY s."createdAt" DESC`
      );
      return res.json(sessions);
    }

    if (req.method === 'POST') {
      const { customerId, sessionName, assessmentMode, responses } = req.body;
      
      const session = await queryOne(
        `INSERT INTO scoping_sessions 
         ("customerId", "sessionName", "assessmentMode", responses, status, version, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'draft', 1, NOW(), NOW())
         RETURNING *`,
        [customerId, sessionName, assessmentMode || 'guided', JSON.stringify(responses || {})]
      );

      return res.status(201).json(session);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/sessions:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
