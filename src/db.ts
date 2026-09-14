import pg from 'pg';
import { DATABASE_URL } from './config.js';

export const pool = new pg.Pool({ connectionString: DATABASE_URL });

export async function initSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      user_email  TEXT PRIMARY KEY,
      password    TEXT NOT NULL,
      balance     BIGINT NOT NULL DEFAULT 0,
      is_canary   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id          BIGSERIAL PRIMARY KEY,
      user_email  TEXT NOT NULL REFERENCES accounts(user_email),
      amount      BIGINT NOT NULL,
      type        TEXT NOT NULL CHECK (type IN ('send','receive')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export async function resetSchema(): Promise<void> {
  await pool.query('DROP TABLE IF EXISTS transactions;');
  await pool.query('DROP TABLE IF EXISTS accounts;');
  await initSchema();
}
