import jwt from 'jsonwebtoken';
import { IDP_SIGNING_SECRET, IDP_ISSUER, IDP_AUDIENCE } from './config.js';

// Minimal stand-in for a Cognito-style identity provider. It mints two kinds of
// token, both signed with the same key:
//   - access:   issued after a successful password login
//   - recovery: issued by the "account recovery" flow (would normally be emailed
//               to the account owner as a one-time link) WITHOUT a password

export interface TokenClaims {
  sub: string; // account email
  token_use: 'access' | 'recovery';
}

export function issueAccessToken(email: string): string {
  return jwt.sign({ sub: email, token_use: 'access' }, IDP_SIGNING_SECRET, {
    issuer: IDP_ISSUER,
    audience: IDP_AUDIENCE,
    expiresIn: '1h',
  });
}

export function issueRecoveryToken(email: string): string {
  return jwt.sign({ sub: email, token_use: 'recovery' }, IDP_SIGNING_SECRET, {
    issuer: IDP_ISSUER,
    audience: IDP_AUDIENCE,
    expiresIn: '15m',
  });
}
