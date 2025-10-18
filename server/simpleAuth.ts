import express, { type Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import { storage } from "./storage.js";

const PgSession = connectPg(session);

export async function setupAuth(app: Express) {
  let sessionStore;
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    sessionStore = new PgSession({
      pool,
      tableName: 'sessions',
      createTableIfMissing: true,
    });
  }

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'demo-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    const userId = email.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    await storage.upsertUser({
      id: userId,
      email: email,
      firstName: email.split('@')[0],
      lastName: '',
      profileImageUrl: null,
    });

    (req.session as any).userId = userId;
    (req.session as any).email = email;
    
    res.json({ success: true, user: { id: userId, email } });
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/auth/user', async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl
    });
  });

  app.use((req: any, res, next) => {
    req.isAuthenticated = () => !!(req.session as any)?.userId;
    req.user = {
      claims: {
        sub: (req.session as any)?.userId || null,
        email: (req.session as any)?.email || null,
      }
    };
    next();
  });
}
