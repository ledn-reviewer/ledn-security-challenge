import { createHmac } from 'node:crypto';

// Per-candidate identifier. Seeds the synthetic dataset and derives the flags so
// that no two candidates receive the same data or the same valid flag values.
export const CANDIDATE_ID = process.env.CANDIDATE_ID ?? 'demo';

export const PORT = Number(process.env.PORT ?? 4000);
export const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://ledn:ledn@localhost:5432/ledn_token';

// Fake symmetric signing secret for the local identity provider. This is NOT a
// real Ledn secret — it is a throwaway value for this sandbox only.
export const IDP_SIGNING_SECRET =
  process.env.IDP_SIGNING_SECRET ?? 'sandbox-idp-secret-not-a-real-key';

export const IDP_ISSUER = 'ledn-token-idp';
export const IDP_AUDIENCE = 'ledn-token-api';

// A stable per-candidate seed derived from the candidate id.
export function candidateSeed(): number {
  const h = createHmac('sha256', 'ledn-token-challenge').update(CANDIDATE_ID).digest();
  // 31-bit positive integer for faker.seed()
  return h.readUInt32BE(0) & 0x7fffffff;
}

// Deterministic per-candidate flag derivation. The reviewer re-derives the
// expected flag with the same CANDIDATE_ID to grade a submission.
export function flag(kind: string): string {
  const mac = createHmac('sha256', `ledn-flag:${CANDIDATE_ID}`).update(kind).digest('hex');
  return `FLAG{${kind}-${mac.slice(0, 16)}}`;
}

// Canonical email addresses used by the scenario, namespaced per candidate so
// they are unique and obviously fictional.
export const CANARY_EMAIL = `canary+${CANDIDATE_ID}@ledn-token.example`;
export const VICTIM_EMAIL = `victim+${CANDIDATE_ID}@ledn-token.example`;
export const ATTACKER_EMAIL = `attacker+${CANDIDATE_ID}@ledn-token.example`;
export const ATTACKER_PASSWORD = 'attacker-known-password';
// The victim uses a weak, guessable password on purpose (credential-stuffing narrative).
export const VICTIM_PASSWORD = 'Summer2024!';
