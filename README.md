# Ledn Security Engineering Challenge

Thank you for your interest in Ledn. This take-home is a small, intentionally
vulnerable token-ledger service. It is designed to show how you investigate a
realistic security problem, prioritize customer risk, implement durable fixes,
and communicate your reasoning.

The repository is the complete challenge package. You do not need a separate
document or access to any Ledn system.

> **Safety:** Run this project only on your own machine. Read
> [`SCOPE.md`](./SCOPE.md) before doing anything else, and never expose the
> service to the internet.

## Start here

Read the challenge material in this order:

1. [`SCOPE.md`](./SCOPE.md) — mandatory rules of engagement and data-handling
   boundaries.
2. [`CANDIDATE.md`](./CANDIDATE.md) — the scenario, required work, time budget,
   deliverables, review criteria, and submission process.
3. [`infra/README.md`](./infra/README.md) and
   [`evidence/README.md`](./evidence/README.md) — optional modules. Only complete
   these if your invitation assigns them. If you explore one voluntarily, finish
   the core first.

The core objective is straightforward: find and demonstrate the shortest
credible path to unauthorized loss of tokens, fix its root causes without
breaking legitimate behavior, and prove the fixes with regression tests.

## Prepare your private working repository

Do not open a pull request against this challenge repository. Clone it, detach
your copy from the source repository, and push your work to a new **private**
repository under your own GitHub account:

```bash
git clone https://github.com/ledn-reviewer/ledn-security-challenge.git
cd ledn-security-challenge
git remote remove origin
git remote add origin <your-private-repository-url>
git push -u origin HEAD
```

Keep your submission private and do not publish challenge solutions, flags, or
exploit details.

## Requirements

- Docker with Docker Compose v2
- Make
- Node.js 20 or newer and npm (for the test runner)
- Git

No AWS account, Ledn credentials, or third-party service is required.

## Configure and run

```bash
cp .env.example .env
# Set CANDIDATE_ID in .env to the identifier included in your invitation.
# If you were not given one, leave it as "demo".

make up       # build, start, and seed the local stack
make test     # run the starter functional tests
make down     # stop the stack and remove its local database volume
```

The API is available at `http://localhost:4000` and both exposed ports bind to
`127.0.0.1`. The starter tests should pass before you make changes. The service
is still intentionally insecure at that point.

Useful commands:

```bash
make help       # list supported commands
make logs       # follow API logs
make seed       # restore the synthetic dataset for your CANDIDATE_ID
make reset      # rebuild a clean local stack
make detection  # optional Module D: run your detection against the supplied logs
```

## Repository guide

| Path | Purpose |
| --- | --- |
| `src/` | TypeScript/Express API to investigate and patch |
| `tests/` | Passing functional tests; extend these with security regressions |
| `infra/` | Optional cloud and identity review fixture (no AWS required) |
| `evidence/` | Optional detection and incident-reconstruction fixture |
| `SECURITY-FINDINGS.template.md` | Suggested structure for your final report |
| `CANDIDATE.md` | Authoritative challenge brief and submission checklist |

## What you will submit

Your private repository should contain:

- a prioritized `SECURITY-FINDINGS.md` report;
- runnable proof-of-exploit code for your top findings;
- root-cause fixes in the application;
- regression tests, including an adversarial concurrent test;
- exact commands needed to reproduce the exploit and run all tests; and
- your assumptions, time spent, next steps, and any use of AI tools.

You may start with [`SECURITY-FINDINGS.template.md`](./SECURITY-FINDINGS.template.md).
See [`CANDIDATE.md`](./CANDIDATE.md) for the full requirements and submission
steps.

## How we review the work

We look primarily at:

1. **Exploitability and evidence** — the important findings are reproducible and
   tied to concrete customer impact.
2. **Correctness of the fixes** — fixes address the root cause and preserve
   legitimate behavior.
3. **Regression coverage** — tests fail against the original weakness and pass
   after the fix, including under concurrency.
4. **Risk judgment** — findings are prioritized; trade-offs, assumptions, and
   remaining risk are clear.
5. **Reproducibility and communication** — another engineer can run and
   understand the work from the repository alone.
6. **Assigned optional modules** — evaluated only when included in your
   invitation.

There is no expectation that you fix every weakness. A small number of
well-proven, correctly remediated high-impact findings is stronger than a long
scanner-style list.
