import type { VercelRequest } from '@vercel/node';

export function getUserId(req: VercelRequest): string | null {
  if (!(req as any).isAuthenticated || !(req as any).isAuthenticated() || !(req as any).user) {
    return null;
  }
  const claims = ((req as any).user as any).claims;
  return claims?.sub || null;
}

export function requireAuth(req: VercelRequest, res: any): string | null {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return userId;
}
