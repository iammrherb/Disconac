import { sql } from '@vercel/postgres';

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await sql.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await sql.query(text, params);
  return result.rows[0] as T || null;
}

export { sql };
