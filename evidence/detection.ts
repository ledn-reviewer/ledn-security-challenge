// CANDIDATE DELIVERABLE (detection module).
//
// Implement `detect` to identify compromised accounts from the telemetry. Return
// one alert per account you believe was taken over. You are scored on precision
// and recall against private labels and additional cases, plus your written
// false-positive / evasion analysis.
//
// This starter implementation is deliberately naive (it alerts on any login
// failure) so you can see the runner execute. Replace it.

export interface AuthEvent {
  ts: string;
  event: string;
  userEmail: string;
  ip: string;
  xForwardedFor?: string;
  userAgent: string;
}
export interface ApiReq {
  ts: string;
  method: string;
  path: string;
  actorSub: string;
  bodyUserEmail?: string;
  status: number;
  ip: string;
}
export interface Alert {
  userEmail: string;
  reason: string;
}

export function detect(auth: AuthEvent[], _api: ApiReq[]): Alert[] {
  const alerts = new Map<string, string>();
  for (const e of auth) {
    if (e.event === 'LOGIN_FAILURE') {
      alerts.set(e.userEmail, 'had a login failure'); // naive — replace me
    }
  }
  return [...alerts].map(([userEmail, reason]) => ({ userEmail, reason }));
}
