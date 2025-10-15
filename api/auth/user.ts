import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne } from '../_shared/db-client.js';
import { getUserId } from '../_shared/auth-helper.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const userId = getUserId(req);
    
    if (!userId) {
      return res.json({
        user: null,
        isAuthenticated: false,
      });
    }

    const user = await queryOne(
      'SELECT id, email, "firstName", "lastName", "profileImageUrl" FROM users WHERE id = $1',
      [userId]
    );
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      ...user,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error('Error in /api/auth/user:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
