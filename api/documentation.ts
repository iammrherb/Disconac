import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_shared/db-client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const searchQuery = req.query.q as string | undefined;
      
      let docs;
      if (searchQuery) {
        docs = await query(
          `SELECT * FROM documentation_links 
           WHERE title ILIKE $1 OR content ILIKE $1 
           ORDER BY title`,
          [`%${searchQuery}%`]
        );
      } else {
        docs = await query('SELECT * FROM documentation_links ORDER BY title');
      }

      return res.json(docs);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/documentation:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
