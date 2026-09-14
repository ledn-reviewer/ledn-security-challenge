import { faker } from '@faker-js/faker';
import { pool, resetSchema } from './db.js';
import {
  candidateSeed,
  CANARY_EMAIL,
  VICTIM_EMAIL,
  VICTIM_PASSWORD,
  ATTACKER_EMAIL,
  ATTACKER_PASSWORD,
} from './config.js';

// Seeds a fully synthetic dataset. Nothing here is real customer data — all
// accounts are generated with faker under a per-candidate deterministic seed.
const NUM_ACCOUNTS = 60;
const MAX_TX_PER_ACCOUNT = 12;
const MAX_TX_AMOUNT = 10_000;

// A small set of common passwords, so the credential-stuffing narrative is
// exercisable. Ordinary accounts get random strong passwords.
const WEAK_PASSWORDS = ['Summer2024!', 'Password1', 'Ledn1234', 'Winter2023', 'Qwerty123!'];

function randInt(max: number): number {
  return faker.number.int({ min: 0, max });
}

async function insertAccount(email: string, password: string, isCanary = false): Promise<void> {
  await pool.query(
    'INSERT INTO accounts (user_email, password, balance, is_canary) VALUES ($1,$2,0,$3) ON CONFLICT (user_email) DO NOTHING',
    [email, password, isCanary],
  );
}

async function applyTx(email: string, amount: number, type: 'send' | 'receive'): Promise<void> {
  await pool.query('INSERT INTO transactions (user_email, amount, type) VALUES ($1,$2,$3)', [
    email,
    amount,
    type,
  ]);
  const delta = type === 'receive' ? amount : -amount;
  await pool.query('UPDATE accounts SET balance = balance + $2 WHERE user_email = $1', [
    email,
    delta,
  ]);
}

async function main() {
  faker.seed(candidateSeed());
  await resetSchema();

  // Ordinary accounts with a realistic, non-negative transaction history.
  for (let i = 0; i < NUM_ACCOUNTS; i++) {
    const email = faker.internet.email().toLowerCase();
    const password = faker.helpers.arrayElement([
      ...WEAK_PASSWORDS,
      faker.internet.password({ length: 16 }),
      faker.internet.password({ length: 16 }),
    ]);
    await insertAccount(email, password);

    let rolling = 0;
    const n = randInt(MAX_TX_PER_ACCOUNT);
    for (let j = 0; j < n; j++) {
      const amount = 1 + randInt(MAX_TX_AMOUNT);
      // Never let a seeded account go negative.
      const type: 'send' | 'receive' = rolling >= amount && faker.datatype.boolean() ? 'send' : 'receive';
      rolling += type === 'receive' ? amount : -amount;
      await applyTx(email, amount, type);
    }
  }

  // Scenario accounts.
  // Victim: weak password, holds a normal balance (target of the ATO narrative).
  await insertAccount(VICTIM_EMAIL, VICTIM_PASSWORD);
  await applyTx(VICTIM_EMAIL, 25_000, 'receive');

  // Attacker: an account the candidate is told they control.
  await insertAccount(ATTACKER_EMAIL, ATTACKER_PASSWORD);
  await applyTx(ATTACKER_EMAIL, 500, 'receive');

  // Canary: the token "vault". Moving tokens out of this account is the objective.
  await insertAccount(CANARY_EMAIL, faker.internet.password({ length: 24 }), true);
  await applyTx(CANARY_EMAIL, 1_000_000, 'receive');

  const { rows } = await pool.query('SELECT count(*)::int AS n FROM accounts');
  // eslint-disable-next-line no-console
  console.log(`seeded ${rows[0].n} accounts (candidate dataset)`);
  await pool.end();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
