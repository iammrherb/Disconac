import type { VercelRequest, VercelResponse } from '@vercel/node';
import { registerRoutes } from '../server/routes';
import express from 'express';
import session from 'express-session';
import passport from 'passport';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

app.use(passport.initialize());
app.use(passport.session());

registerRoutes(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
