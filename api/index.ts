import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes.js';

let app: express.Express | null = null;

async function getApp() {
  if (app) return app;
  
  app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  app.use((req: any, res, next) => {
    req.isAuthenticated = () => true;
    req.user = {
      claims: {
        sub: 'demo-user-id',
        email: 'demo@portnox.com',
        first_name: 'Demo',
        last_name: 'User',
        profile_image_url: null
      }
    };
    next();
  });

  await registerRoutes(app);
  
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = await getApp();
  return expressApp(req as any, res as any);
}
