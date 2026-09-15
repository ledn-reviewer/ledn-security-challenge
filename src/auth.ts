import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IDP_SIGNING_SECRET } from './config.js';

export interface AuthedRequest extends Request {
  auth?: { sub: string; token_use?: string };
}

// Bearer-token authentication middleware.
//
// It verifies the token signature against the IdP key and attaches the caller
// identity to the request. Downstream handlers use `req.auth.sub` as the
// authenticated principal.
export function authenticate(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'missing bearer token' });
    return;
  }
  try {
    const claims = jwt.verify(token, IDP_SIGNING_SECRET) as jwt.JwtPayload;
    req.auth = { sub: String(claims.sub), token_use: claims.token_use as string };
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}
