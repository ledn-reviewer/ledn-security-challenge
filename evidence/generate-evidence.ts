// Generates the synthetic telemetry for the detection module, deterministically
// from CANDIDATE_ID. Produces:
//   evidence/auth-events.ndjson         (Cognito-style identity events)
//   evidence/api-requests.ndjson        (application access log)
//   evidence/ground-truth.json          (labels: which account was compromised)
//
// Run:  npx tsx evidence/generate-evidence.ts
import { createHmac } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { CANDIDATE_ID, VICTIM_EMAIL, CANARY_EMAIL, ATTACKER_EMAIL } from '../src/config.js';

// Tiny seeded PRNG so output is stable per candidate without extra deps.
let s = createHmac('sha256', 'evidence').update(CANDIDATE_ID).digest().readUInt32BE(0) || 1;
const rand = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = <T,>(xs: T[]): T => xs[Math.floor(rand() * xs.length)];
const pad = (n: number) => String(n).padStart(2, '0');

const DAY = '2026-08-12';
function ts(hour: number, min: number, sec = Math.floor(rand() * 60)): string {
  return `${DAY}T${pad(hour)}:${pad(min)}:${pad(sec)}.000Z`;
}

const benignEmails = Array.from({ length: 8 }, (_, i) => `user${i}+${CANDIDATE_ID}@ledn-token.example`);
const attackerIps = Array.from({ length: 24 }, (_, i) => `185.220.${100 + i}.${10 + Math.floor(rand() * 200)}`); // rotating "residential proxy" pool
const homeIp = '81.44.12.9'; // victim's usual IP
const corpNat = '52.19.44.7'; // shared corporate NAT (benign noise)

interface AuthEvent {
  ts: string;
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'RECOVERY_TOKEN_ISSUED' | 'MFA_CHALLENGE';
  userEmail: string;
  ip: string;
  xForwardedFor?: string;
  userAgent: string;
}
interface ApiReq {
  ts: string;
  method: string;
  path: string;
  actorSub: string;
  bodyUserEmail?: string;
  status: number;
  ip: string;
}

const auth: AuthEvent[] = [];
const api: ApiReq[] = [];
const UA = 'Mozilla/5.0 (challenge-sim)';

// 1) Baseline benign logins across the morning.
for (let i = 0; i < 40; i++) {
  const e = pick(benignEmails);
  auth.push({ ts: ts(8 + Math.floor(rand() * 3), Math.floor(rand() * 60)), event: 'LOGIN_SUCCESS', userEmail: e, ip: pick([homeIp, corpNat, `90.16.${Math.floor(rand() * 255)}.4`]), userAgent: UA });
}
// Benign: victim logs in normally earlier from home IP.
auth.push({ ts: ts(8, 5), event: 'LOGIN_SUCCESS', userEmail: VICTIM_EMAIL, ip: homeIp, userAgent: UA });
// Benign noise: a traveler + password-manager retries (two quick failures then success, same IP).
auth.push({ ts: ts(9, 2), event: 'LOGIN_FAILURE', userEmail: benignEmails[0], ip: corpNat, userAgent: UA });
auth.push({ ts: ts(9, 2), event: 'LOGIN_FAILURE', userEmail: benignEmails[0], ip: corpNat, userAgent: UA });
auth.push({ ts: ts(9, 3), event: 'LOGIN_SUCCESS', userEmail: benignEmails[0], ip: corpNat, userAgent: UA });

// 2) Credential-stuffing burst against the victim from rotating XFF at ~11:1x.
for (let i = 0; i < 22; i++) {
  auth.push({
    ts: ts(11, 10 + Math.floor(i / 4), 5 * (i % 12)),
    event: 'LOGIN_FAILURE',
    userEmail: VICTIM_EMAIL,
    ip: '203.0.113.7', // same real socket peer...
    xForwardedFor: attackerIps[i % attackerIps.length], // ...rotating spoofed XFF
    userAgent: UA,
  });
}
// 3) The successful takeover (guessed weak password), same socket peer + spoofed XFF.
auth.push({ ts: ts(11, 16, 40), event: 'LOGIN_SUCCESS', userEmail: VICTIM_EMAIL, ip: '203.0.113.7', xForwardedFor: attackerIps[0], userAgent: UA });
// Attacker also mints a recovery token for the canary (token_use confusion path).
auth.push({ ts: ts(11, 17, 10), event: 'RECOVERY_TOKEN_ISSUED', userEmail: CANARY_EMAIL, ip: '203.0.113.7', xForwardedFor: attackerIps[1], userAgent: UA });

// 4) API activity: normal traffic + the fraudulent withdrawals.
for (let i = 0; i < 30; i++) {
  const e = pick(benignEmails);
  api.push({ ts: ts(8 + Math.floor(rand() * 4), Math.floor(rand() * 60)), method: 'POST', path: '/transactions', actorSub: e, bodyUserEmail: e, status: 201, ip: homeIp });
}
// IDOR: actor = victim (post-ATO) sends from the canary account it does not own.
api.push({ ts: ts(11, 18, 2), method: 'POST', path: '/transactions', actorSub: VICTIM_EMAIL, bodyUserEmail: CANARY_EMAIL, status: 201, ip: '203.0.113.7' });
api.push({ ts: ts(11, 18, 9), method: 'POST', path: '/transactions', actorSub: VICTIM_EMAIL, bodyUserEmail: CANARY_EMAIL, status: 201, ip: '203.0.113.7' });
// Recovery-token authorized send.
api.push({ ts: ts(11, 18, 20), method: 'POST', path: '/transactions', actorSub: CANARY_EMAIL, bodyUserEmail: CANARY_EMAIL, status: 201, ip: '203.0.113.7' });

auth.sort((a, b) => a.ts.localeCompare(b.ts));
api.sort((a, b) => a.ts.localeCompare(b.ts));

const dir = new URL('.', import.meta.url).pathname;
writeFileSync(`${dir}auth-events.ndjson`, auth.map((e) => JSON.stringify(e)).join('\n') + '\n');
writeFileSync(`${dir}api-requests.ndjson`, api.map((e) => JSON.stringify(e)).join('\n') + '\n');
writeFileSync(
  `${dir}ground-truth.json`,
  JSON.stringify(
    {
      incidentWindow: [`${DAY}T11:00:00Z`, `${DAY}T11:30:00Z`],
      compromisedAccounts: [VICTIM_EMAIL],
      drainedAccounts: [CANARY_EMAIL],
      attackerSocketIp: '203.0.113.7',
      benignLookalikes: [benignEmails[0]],
      notes: 'Credential stuffing via rotating X-Forwarded-For -> ATO of victim -> IDOR + recovery-token withdrawals from canary.',
    },
    null,
    2,
  ) + '\n',
);
// eslint-disable-next-line no-console
console.log(`wrote auth-events (${auth.length}), api-requests (${api.length}), ground-truth for candidate=${CANDIDATE_ID}`);
