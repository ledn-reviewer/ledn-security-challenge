# Module D (optional) — Detection & incident reconstruction

The security team captured telemetry from the day of a suspected incident:

- [`auth-events.ndjson`](./auth-events.ndjson) — identity events (logins, failures, recovery-token issuance).
- [`api-requests.ndjson`](./api-requests.ndjson) — application access log for `/transactions`.

There is normal customer traffic in here too — including benign lookalikes (a
password-manager retry, a shared corporate NAT). Do not just "alert on anything
unusual."

### Deliverables

1. **Incident reconstruction** — a timeline: how the account was compromised, which account(s), and what the attacker did afterwards. Name the entry technique.
2. **Detection** — implement `detect()` in [`detection.ts`](./detection.ts). Return one alert per account you believe was taken over. Score it:

   ```
   make replay-detections      # prints precision / recall / F1 vs held-out ground truth
   ```

   The starter implementation is intentionally naive and will score poorly — replace it.
3. **False positives & evasion** — which benign patterns would a crude rule misfire on, and how would an attacker evade *your* rule?
4. **Response** — the immediate containment actions and the one durable control you would add.

`ground-truth.json` holds the labels the harness scores against. In a real
sitting each candidate receives a different dataset (regenerate with
`CANDIDATE_ID=<id> npx tsx evidence/generate-evidence.ts`), so memorised answers
do not transfer.
