# Scope, rules of engagement & data handling

Please read this before you start. It protects you and us.

## In scope

- The code in **this repository**, running **locally on your own machine** via `make up`.
- The local API (`http://localhost:4000`), the local Postgres, and the fixtures in `infra/` and `evidence/`.

That is the entire target. Everything you need to complete the challenge is here.

## Explicitly out of scope — do not do this

- **Do not** test, scan, probe, enumerate, or attempt to access **any** Ledn production, staging, or corporate system, domain, API, cloud account, or employee.
- **Do not** use anything you find here (account names, header names, secret-looking strings, ARNs) against any real Ledn system. All of it is **fictional and synthetic** — invented for this exercise.
- **Do not** attack third-party services while working on this challenge.

This is a self-contained sandbox. There is no scenario in which the correct solution requires you to touch a live system. Reaching outside this repo is an automatic disqualification, and depending on the target may be unlawful — the same professional boundary we expect on the job.

## About the data and the vulnerabilities

- All accounts, balances, transactions, logs, IAM ARNs, and "secrets" are **synthetic**. There is no real customer data anywhere in this repository.
- The signing secret in the code/Terraform is a throwaway sandbox value, not a real key.
- The application is **intentionally vulnerable** for this exercise. Do not deploy it anywhere reachable from the internet.

## AI tools

Using AI assistants (including code assistants) is allowed. Please note in your
submission where you used them. You will be asked to explain and defend your work
in the follow-up conversation — that discussion, not a tooling ban, is how we
assess authorship.

## Questions

If anything is ambiguous, state your assumption in your write-up and proceed. We
value candidates who make a reasonable call and document it.
