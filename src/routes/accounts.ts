import { Router } from 'express';
import { pool } from '../db.js';
import { authenticate, type AuthedRequest } from '../auth.js';

export const accountsRouter = Router();

// Fetch an account and its current balance.
accountsRouter.get('/:email', authenticate, async (req: AuthedRequest, res) => {
  const email = req.params.email;
  const { rows } = await pool.query(
    'SELECT user_email, balance, created_at, updated_at FROM accounts WHERE user_email = $1',
    [email],
  );
  if (rows.length === 0) return res.status(404).json({ error: 'no such account' });
  const a = rows[0];
  return res.json({
    userEmail: a.user_email,
    balance: Number(a.balance),
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  });
});
