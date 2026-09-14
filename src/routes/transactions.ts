import { Router } from 'express';
import { pool } from '../db.js';
import { authenticate, type AuthedRequest } from '../auth.js';
import { flag } from '../config.js';

export const transactionsRouter = Router();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Create a `send` or `receive` transaction against an account.
//
//   - `receive` credits the account.
//   - `send` debits the account (an outbound transfer of tokens off-platform),
//     and must not overdraw the account.
//
// The current balance is the running sum of an account's transactions.
transactionsRouter.post('/', authenticate, async (req: AuthedRequest, res) => {
  const { userEmail, amount, type } = req.body ?? {};
  if (
    !userEmail ||
    typeof amount !== 'number' ||
    !Number.isInteger(amount) ||
    amount <= 0 ||
    (type !== 'send' && type !== 'receive')
  ) {
    return res
      .status(400)
      .json({ error: 'userEmail, a positive integer amount, and type send|receive are required' });
  }

  const acct = await pool.query(
    'SELECT user_email, balance, is_canary FROM accounts WHERE user_email = $1',
    [userEmail],
  );
  if (acct.rows.length === 0) return res.status(404).json({ error: 'no such account' });
  const currentBalance = Number(acct.rows[0].balance);
  const isCanary = acct.rows[0].is_canary as boolean;

  if (type === 'receive') {
    await pool.query('INSERT INTO transactions (user_email, amount, type) VALUES ($1,$2,$3)', [
      userEmail,
      amount,
      'receive',
    ]);
    const upd = await pool.query(
      'UPDATE accounts SET balance = balance + $2, updated_at = now() WHERE user_email = $1 RETURNING balance',
      [userEmail, amount],
    );
    return res.status(201).json({ userEmail, type, amount, balance: Number(upd.rows[0].balance) });
  }

  // type === 'send'
  if (currentBalance < amount) {
    return res.status(422).json({ error: 'insufficient balance' });
  }

  // Record the transfer and debit the account.
  await sleep(60); // simulated downstream transfer / settlement latency
  await pool.query('INSERT INTO transactions (user_email, amount, type) VALUES ($1,$2,$3)', [
    userEmail,
    amount,
    'send',
  ]);
  const upd = await pool.query(
    'UPDATE accounts SET balance = balance - $2, updated_at = now() WHERE user_email = $1 RETURNING balance',
    [userEmail, amount],
  );
  const newBalance = Number(upd.rows[0].balance);

  const response: Record<string, unknown> = { userEmail, type, amount, balance: newBalance };

  // --- Scenario instrumentation (not part of a real API) ---------------------
  // The sandbox surfaces a flag whenever an action demonstrates a specific class
  // of broken control, so a candidate can prove an exploit worked. Real systems
  // do not emit flags; this block is here purely for grading.
  if (req.auth!.sub !== userEmail && isCanary) {
    response.flag = flag('idor-withdrawal');
  }
  if (req.auth!.token_use === 'recovery') {
    response.recoveryFlag = flag('recovery-token-abuse');
  }
  if (newBalance < 0) {
    response.raceFlag = flag('race-negative-balance');
  }
  return res.status(201).json(response);
});
