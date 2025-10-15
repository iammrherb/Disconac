import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from './_shared/db-client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const sessions = await query(
        `SELECT s.*, c.company_name 
         FROM scoping_sessions s 
         LEFT JOIN customer_profiles c ON s.customer_id = c.id 
         ORDER BY s.created_at DESC`
      );
      return res.json(sessions);
    }

    if (req.method === 'POST') {
      const { customerId, sessionName, assessmentMode, responses } = req.body;
      
      const session = await queryOne(
        `INSERT INTO scoping_sessions 
         (customer_id, session_name, assessment_mode, status, version, created_at, updated_at)
         VALUES ($1, $2, $3, 'draft', '2.1', NOW(), NOW())
         RETURNING *`,
        [customerId, sessionName, assessmentMode || 'standard']
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
