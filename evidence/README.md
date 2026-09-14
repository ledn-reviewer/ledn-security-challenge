# Module D (optional) — Detection and incident reconstruction

The security team captured telemetry from the day of a suspected incident:

- [`auth-events.ndjson`](./auth-events.ndjson) — identity events such as logins,
  failures, and recovery-token issuance.
- [`api-requests.ndjson`](./api-requests.ndjson) — application access logs for
  `/transactions`.

The dataset includes normal customer traffic and benign lookalikes. A useful
detection must distinguish suspicious sequences from ordinary retries or users
sharing a network.

## Deliverables

1. **Incident reconstruction.** Provide a timestamped timeline explaining which
   account or accounts were compromised, the likely entry technique, and what
   happened afterward. Separate observed facts from your inferences.
2. **Detection.** Replace the starter `detect()` implementation in
   [`detection.ts`](./detection.ts). Return one alert per account you believe was
   taken over, with a reason that explains the correlated signals.
3. **Validation.** Add focused tests or test fixtures that demonstrate why your
   rule catches the malicious sequence without alerting on the benign patterns
   you identified. You can inspect your output with:

   ```bash
   make detection
   ```

4. **False positives and evasion.** Explain which legitimate patterns a crude
   rule would misclassify and how an attacker could evade your rule.
5. **Response.** Describe the immediate containment actions and one durable
   control you would add.

We evaluate signal selection, correlation, precision/recall reasoning, and the
quality of the response plan against private labels and additional cases. The
expected answer is not included in this repository.
