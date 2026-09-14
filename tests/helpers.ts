import pg from 'pg';
import { DATABASE_URL } from '../src/config.js';

export const BASE = process.env.API_BASE_URL ?? 'http://localhost:4000';

export async function api(
  path: string,
  opts: { method?: string; body?: unknown; token?: string } = {},
) {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let json: any = undefined;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = text;
  }
  return { status: res.status, body: json };
}

export async function login(userEmail: string, password: string): Promise<string> {
  const { body } = await api('/auth/login', { method: 'POST', body: { userEmail, password } });
  return body.accessToken;
}

// Direct-to-DB helper so tests can set up deterministic preconditions
// (the API exposes no admin/setup endpoints).
export async function setBalance(userEmail: string, balance: number): Promise<void> {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  await pool.query('UPDATE accounts SET balance = $1 WHERE user_email = $2', [balance, userEmail]);
  await pool.end();
}

export async function getBalanceDirect(userEmail: string): Promise<number> {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const { rows } = await pool.query('SELECT balance FROM accounts WHERE user_email = $1', [
    userEmail,
  ]);
  await pool.end();
  return Number(rows[0].balance);
}
