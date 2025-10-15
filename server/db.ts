// Database connection using Drizzle ORM with Neon PostgreSQL
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

if (typeof WebSocket === 'undefined') {
  const ws = require('ws');
  neonConfig.webSocketConstructor = ws;
} else {
  neonConfig.webSocketConstructor = WebSocket;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
