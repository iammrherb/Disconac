import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import { Pool } from '@neondatabase/serverless';
import { registerRoutes } from '../server/routes.js';

const PgSession = connectPgSimple(session);

let app: express.Express | null = null;
let sessionStore: any = null;

async function getApp() {
  if (app) return app;
  
  app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  if (!sessionStore && process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    sessionStore = new PgSession({
      pool,
      tableName: 'sessions',
    });
  }
  
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'vercel-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  await registerRoutes(app);
  
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = await getApp();
  return expressApp(req as any, res as any);
}
