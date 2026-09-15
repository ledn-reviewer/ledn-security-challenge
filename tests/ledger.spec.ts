import { describe, it, expect, beforeAll } from 'vitest';
import { api, login, setBalance } from './helpers.js';
import { ATTACKER_EMAIL, ATTACKER_PASSWORD } from '../src/config.js';

// Starter functional tests. These describe the intended behaviour of the ledger
// and should pass against the API as shipped. Use them as a base to add your own
// tests (including the security regression tests you will want for your fixes).
//
// Requires the stack to be running and seeded:  make up
describe('ledger — functional behaviour', () => {
  let token: string;

  beforeAll(async () => {
    token = await login(ATTACKER_EMAIL, ATTACKER_PASSWORD);
    await setBalance(ATTACKER_EMAIL, 1000);
  });

  it('returns an account and its balance', async () => {
    const { status, body } = await api(`/accounts/${ATTACKER_EMAIL}`, { token });
    expect(status).toBe(200);
    expect(body.userEmail).toBe(ATTACKER_EMAIL);
    expect(typeof body.balance).toBe('number');
  });

  it('a receive transaction increases the balance', async () => {
    await setBalance(ATTACKER_EMAIL, 1000);
    const { status } = await api('/transactions', {
      method: 'POST',
      token,
      body: { userEmail: ATTACKER_EMAIL, amount: 250, type: 'receive' },
    });
    expect(status).toBe(201);
    const { body } = await api(`/accounts/${ATTACKER_EMAIL}`, { token });
    expect(body.balance).toBe(1250);
  });

  it('a send transaction decreases the balance', async () => {
    await setBalance(ATTACKER_EMAIL, 1000);
    const { status, body } = await api('/transactions', {
      method: 'POST',
      token,
      body: { userEmail: ATTACKER_EMAIL, amount: 400, type: 'send' },
    });
    expect(status).toBe(201);
    expect(body.balance).toBe(600);
  });

  it('rejects a single send that exceeds the balance', async () => {
    await setBalance(ATTACKER_EMAIL, 100);
    const { status } = await api('/transactions', {
      method: 'POST',
      token,
      body: { userEmail: ATTACKER_EMAIL, amount: 100000, type: 'send' },
    });
    expect(status).toBe(422);
  });

  it('requires authentication', async () => {
    const { status } = await api(`/accounts/${ATTACKER_EMAIL}`);
    expect(status).toBe(401);
  });
});
