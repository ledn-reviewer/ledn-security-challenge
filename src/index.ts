import express from 'express';
import { PORT } from './config.js';
import { initSchema } from './db.js';
import { authRouter } from './routes/auth.js';
import { accountsRouter } from './routes/accounts.js';
import { transactionsRouter } from './routes/transactions.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/accounts', accountsRouter);
app.use('/transactions', transactionsRouter);

// Generic error handler. Echoes the error for local debuggability.
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

async function main() {
  await initSchema();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`ledn-token api listening on :${PORT}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
