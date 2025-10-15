import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_shared/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const query = req.query.q as string | undefined;
      const docs = query 
        ? await storage.searchDocumentation(query)
        : await storage.listDocumentation();

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
