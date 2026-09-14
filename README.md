# Ledn Token — Security Engineering Challenge

A self-contained, intentionally vulnerable "token ledger" used to assess security
engineering candidates. It mirrors the house style of our engineering take-home
(the Ledn Token / Star Wars challenge) but the task is to **find, exploit, fix,
detect, and reason about** security flaws rather than build a feature.

> **Candidates:** start with [`CANDIDATE.md`](./CANDIDATE.md) and [`SCOPE.md`](./SCOPE.md).
> **Reviewers:** see [`reviewer/README.md`](./reviewer/README.md) — that directory is **not shipped to candidates.**

## What's here

```
CANDIDATE.md            The brief given to candidates
SCOPE.md                Rules of engagement / ethics / data handling
docker-compose.yml      Local-only stack (Postgres + API), binds to 127.0.0.1
Makefile                up / seed / test / attack / regression / replay targets
src/                    The intentionally vulnerable TS/Express API
tests/                  Starter functional tests (candidate-facing)
infra/                  Module C — cloud/IaC review fixtures (no AWS needed)
evidence/               Module D — detection logs + scoring harness
reviewer/               REVIEWER ONLY — solution, rubric, reference exploit, hidden tests
```

## Run it (local only)

```bash
make up      # build + start + seed  ->  http://localhost:4000
make test    # starter functional tests
make down    # stop + remove volumes
```

Everything binds to `127.0.0.1`. Nothing in this project connects to any Ledn
system. The app is deliberately insecure — **never expose it to the internet.**

## Design & safety

The planted flaws are all **remediated-class** patterns modelled on generic
account-takeover / fraudulent-withdrawal risk — not copies of any live Ledn
issue, and seeded with 100% synthetic data. Per-candidate datasets and flags are
derived from `CANDIDATE_ID`, so answers do not transfer between candidates. See
`reviewer/SOLUTION.md` for the full rationale and the maintenance/rotation plan.
