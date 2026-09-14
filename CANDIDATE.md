# Ledn Token — Security Engineering Challenge

At Ledn, we are eager to find talented, resourceful, and passionate security engineers to help us protect the future of digital asset financial services. As one step in getting to know each other, we ask you to spend a few hours on this take-home.

### Why a take-home?

On-the-spot security interviews are stressful and hide your real ability. This lets you work the way you actually work — read code, break things, fix them, and explain your reasoning — in a low-pressure setting. There is a follow-up conversation where you walk us through what you did; **we do not do live on-the-spot coding.**

### Please read `SCOPE.md` first

It is short and it matters. Everything you need runs locally; **do not test, scan, or touch any Ledn production or corporate system as part of this challenge.**

### The scenario

Meet **Ledn Token** — a fictional internal token ledger (any resemblance to a real product is intentional but the code is not ours in production). An internal API manages customer accounts and their token transactions. The data model is the same one from our engineering challenge:

- **Account** — `userEmail` (unique), `balance` (≥ 0), `createdAt`, `updatedAt`
- **Transaction** — `userEmail`, `amount`, `type` (`send` | `receive`), `createdAt`

`send` moves tokens **off-platform** (an outbound withdrawal); `receive` credits the account. An account's balance is the running sum of its transactions and **must never go negative**. Multiple team members use the API concurrently.

The service has authentication, a login rate-limit, and an account-recovery flow. It also has security weaknesses — that is the point.

### Getting started

```bash
cp .env.example .env
make up        # builds + starts Postgres and the API on http://localhost:4000, and seeds your dataset
make test      # runs the starter functional test suite
make down      # stops everything
```

Your dataset is seeded from your unique `CANDIDATE_ID` (we send it to you). Three accounts matter for the scenario:

- `attacker+<id>@ledn-token.example` — **an account you control** (password: `attacker-known-password`). Treat it as your foothold.
- `victim+<id>@ledn-token.example` — an ordinary customer.
- `canary+<id>@ledn-token.example` — the **token vault**. Moving tokens out of this account is your objective.

Some findings emit a `FLAG{...}` in the API response when you successfully demonstrate a specific broken control. Flags are proof-of-exploit — include the ones you obtain in your report.

---

## What we are asking you to do

### Part 1 — Core (required, ~2.5–3h)

1. **Find.** Review the source in `src/` and the running API. Identify the security vulnerabilities. Prioritise them by real customer impact — we care far more about the few that lead to loss than a long list of low-severity observations.
2. **Exploit.** Provide a **runnable** proof for your top findings — a script or test that demonstrates unauthorised movement of tokens out of an account you do not own, and any flags you obtained. A finding without a working proof is not yet a finding.
3. **Fix.** Patch the root causes so an account cannot be drained by someone who does not own it and can never go negative — **without breaking legitimate behaviour** (the starter tests must still pass).
4. **Prove the fix.** Add regression tests (including an adversarial/concurrent one) that fail on the original code and pass on yours.

### Parts 2–4 — Optional modules (attempt what the time allows / what we ask you to)

- **Module B — Review a risky change.** *(if provided)* Act as the security approver for a withdrawal-feature PR: prioritized findings, proof for the top ones, a patch, and an approve/block decision.
- **Module C — Cloud & identity.** See [`infra/README.md`](./infra/README.md).
- **Module D — Detection & IR.** See [`evidence/README.md`](./evidence/README.md).
- **CISO memo (≤ 500 words).** You are advising Ledn's leadership on this incident. Cover: immediate containment; ship/block decision; 30/90-day actions; and what you would consider for DORA / regulatory (CNMV) escalation — and which facts you would need to make that call.

Do **not** try to fix every possible weakness. Identify and close the **shortest credible path to customer loss**, prove it, and tell us what you would do next with more time.

---

## Time

Budget about **4–6 hours**. If you hit six hours, stop and write down what you would do next — we read that section closely. A clean, well-reasoned partial submission beats a rushed complete one.

## Submission

1. Host your solution in a **private** GitHub repository and include this repo's contents plus your `SECURITY-FINDINGS.md` (report), your exploit(s), your fixes, and your tests.
2. Invite **`Ledn-Reviewer`** as a collaborator.
3. Email us to confirm the invite is sent and your repo is ready.
4. Include instructions to run your exploit and your tests.

## How we evaluate

We publish our rubric intent up front: **exploitability and evidence, correctness of the root-cause fix, regression/concurrency tests, and the clarity of your risk reasoning.** We reward a genuine finding we did *not* plant more than completing the scripted path. Using AI tools is fine — tell us where you did and be ready to defend every line in the follow-up. The interview is where we confirm the work is yours.

Good luck — we want you to succeed as much as you do.
