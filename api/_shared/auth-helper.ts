import type { VercelRequest } from '@vercel/node';

export function getUserId(req: VercelRequest): string | null {
  return null;
}

export function requireAuth(req: VercelRequest): string | null {
  const userId = getUserId(req);
  if (!userId) {
    return null;
  }
  return userId;
}
