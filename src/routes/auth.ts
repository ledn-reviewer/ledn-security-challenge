import { Router } from 'express';
import { pool } from '../db.js';
import { issueAccessToken, issueRecoveryToken } from '../idp.js';
import { loginRateLimit } from '../rateLimit.js';

export const authRouter = Router();

// Password login. On success, returns an access token.
authRouter.post('/login', loginRateLimit, async (req, res) => {
  const { userEmail, password } = req.body ?? {};
  if (!userEmail || !password) {
    return res.status(400).json({ error: 'userEmail and password are required' });
  }
  const { rows } = await pool.query(
    'SELECT user_email, password FROM accounts WHERE user_email = $1',
    [userEmail],
  );
  if (rows.length === 0 || rows[0].password !== password) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  return res.json({ accessToken: issueAccessToken(userEmail), tokenType: 'Bearer' });
});

// Account recovery. In production this token would be delivered to the account
// owner out-of-band (e.g. emailed as a reset link); it is returned here so the
// flow can be exercised locally without a mail server.
authRouter.post('/recovery-token', async (req, res) => {
  const { userEmail } = req.body ?? {};
  if (!userEmail) return res.status(400).json({ error: 'userEmail is required' });
  const { rows } = await pool.query(
    'SELECT user_email FROM accounts WHERE user_email = $1',
    [userEmail],
  );
  if (rows.length === 0) return res.status(404).json({ error: 'no such account' });
  return res.json({ recoveryToken: issueRecoveryToken(userEmail), tokenType: 'Bearer' });
});
