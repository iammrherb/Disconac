import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_shared/storage.js';
import { requireAuth } from '../_shared/auth-helper.js';
import { generateAIRecommendations } from '../../server/ai-service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { sessionId } = req.query;

  try {
    const session = await storage.getSession(sessionId as string);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    const customer = await storage.getCustomer(session.customerId);
    if (!customer || customer.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this session" });
    }

    const responses = await storage.getResponsesBySessionId(sessionId as string);
    
    const questionnaireData = responses.reduce((acc: Record<string, any>, resp) => {
      acc[resp.question] = resp.response;
      return acc;
    }, {} as Record<string, any>);

    const recommendations = await generateAIRecommendations(
      questionnaireData,
      customer.companyName
    );

    res.json(recommendations);
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    res.status(500).json({ message: "Failed to generate AI recommendations" });
  }
}
