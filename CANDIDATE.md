# Ledn Token — Security Engineering Challenge

At Ledn, we are eager to find talented, resourceful, and thoughtful security
engineers to help protect digital-asset financial services. As one step in
getting to know each other, we ask you to complete this practical take-home.

The goal is to understand how you investigate, prove, and remediate security
risk. We are not looking for a perfect application or the longest possible
finding list. We care about your judgment and whether your conclusions are
supported by working evidence.

## Before you begin

Read [`SCOPE.md`](./SCOPE.md) first. Everything required runs locally. Do not
test, scan, or access any Ledn production, staging, corporate, cloud, or employee
system as part of this challenge.

Set up the repository and local stack using the instructions in
[`README.md`](./README.md). Confirm that `make test` passes before changing the
code.

## Scenario

**Ledn Token** is a fictional internal token ledger. An API manages customer
accounts and their token transactions:

- **Account** — `userEmail` (unique), `balance` (at least 0), `createdAt`, and
  `updatedAt`.
- **Transaction** — `userEmail`, `amount`, `type` (`send` or `receive`), and
  `createdAt`.

`send` moves tokens off-platform; treat it as an outbound withdrawal. `receive`
credits the account. An account's balance is the running result of its
transactions, must never be negative, and may be updated concurrently.

The service includes authentication, login rate limiting, and account recovery.
It also includes intentional security weaknesses.

Your local dataset is derived from `CANDIDATE_ID`. We will include an identifier
in your invitation; use `demo` if none was provided. Three accounts matter:

- `attacker+<id>@ledn-token.example` — an account you control. Its password is
  `attacker-known-password`.
- `victim+<id>@ledn-token.example` — an ordinary customer.
- `canary+<id>@ledn-token.example` — the token vault. Unauthorized movement of
  tokens out of this account demonstrates customer impact.

Some successful exploit paths return a `FLAG{...}` value. Include any flags you
obtain as supporting evidence, but do not treat a flag alone as a complete
finding: we also expect a runnable proof and an explanation of the root cause.

## Required core work

Budget approximately 2.5–3 hours of your total time for the core.

1. **Find and prioritize.** Review the code in `src/` and exercise the running
   API. Identify vulnerabilities, then prioritize them by credible customer
   impact and reachability.
2. **Exploit.** Add a runnable script or test that proves your most important
   findings. At minimum, demonstrate unauthorized movement of tokens out of an
   account you do not own. Record the commands, observed result, and any flags.
3. **Fix.** Patch the root causes so an unauthorized actor cannot drain another
   account and an account cannot become negative. Preserve legitimate behavior;
   the starter functional tests must continue to pass.
4. **Prove the fix.** Add regression tests that fail against the original
   vulnerable behavior and pass after your patch. Include an adversarial test
   with concurrent requests.
5. **Explain.** Write a concise, prioritized `SECURITY-FINDINGS.md`. Explain the
   impact, proof, root cause, fix, remaining risk, and what you would do next.

Do not try to fix every possible weakness. Close the shortest credible path to
customer loss, prove that it is closed, and document what you intentionally left
for later.

## Optional modules

Your invitation will say whether any optional module is part of your sitting. If
it does not mention one, only the core work above is required. Optional work
should never come at the expense of a complete core submission.

- **Module B — Review a risky change.** If a separate change set is provided,
  act as its security approver: give prioritized findings, prove the top issues,
  propose or implement a patch, and make an explicit approve/block decision.
- **Module C — Cloud and identity.** Follow [`infra/README.md`](./infra/README.md).
- **Module D — Detection and incident response.** Follow
  [`evidence/README.md`](./evidence/README.md).
- **CISO memo (500 words maximum).** Advise leadership on immediate containment,
  a ship/block decision, 30/90-day actions, and potential DORA/CNMV escalation.
  Distinguish what is known from the facts still needed to make that call.

## Time budget

Spend about **4–6 hours total**, including documentation. If you reach six hours,
stop and describe what you would do next. We value a clean, well-reasoned partial
submission more than a rushed attempt to cover everything.

Please record your approximate time spent. This is context, not a speed test.

## Deliverables checklist

Your private submission repository must include:

- `SECURITY-FINDINGS.md`, using the supplied template or an equivalent format;
- one or more runnable exploits for the top findings;
- your application fixes;
- passing starter tests plus your security regression tests;
- at least one adversarial/concurrent regression test;
- exact setup, exploit, and test commands in the repository README or report;
- assumptions, known limitations, remaining risks, and next steps;
- approximate time spent; and
- a short disclosure of where you used AI assistance, if applicable.

If an optional module was assigned, include its requested artifacts in the same
repository. Do not include credentials, personal data, or real customer data.

## Evaluation criteria

We evaluate the submission in this order of importance:

1. **Reproducible exploit and evidence.** Can another engineer reliably
   demonstrate the claimed unauthorized outcome? Does the evidence support the
   severity and affected trust boundary?
2. **Root-cause remediation.** Does the implementation remove the underlying
   weakness, including under realistic concurrency, without breaking valid use
   cases?
3. **Regression tests.** Do the tests distinguish the vulnerable and fixed
   behavior and cover both negative and legitimate cases?
4. **Threat modeling and prioritization.** Did you focus on reachable paths to
   material customer harm and explain how weaknesses can be chained?
5. **Risk communication.** Are findings clear, specific, actionable, and honest
   about assumptions and remaining risk?
6. **Reproducibility and engineering quality.** Can we run the work from the
   documented commands, and is the patch appropriately scoped and readable?
7. **Assigned optional modules.** If assigned, we assess the quality of the
   analysis or implementation described in that module's README.

A report-only finding without a working proof will receive limited credit. A
genuine, well-supported issue beyond the intended paths is a strong positive
signal.

AI tools are allowed. Disclose where they were used and be ready to explain and
defend every part of the submitted solution. The follow-up interview will focus
on your decisions, alternatives, and understanding; it does not include surprise
live coding.

## Submission

1. Push your completed work to a **private** GitHub repository. Do not submit a
   pull request to the challenge repository.
2. Invite **`Ledn-Reviewer`** as a collaborator with read access.
3. Verify that the commands in your documentation work from a clean checkout.
4. Email your Ledn contact with the private repository URL and confirm that the
   collaborator invitation has been sent.

We will review the repository and schedule a follow-up conversation if the
submission meets the criteria. You will walk us through a malicious request,
your fix, the tests, and the trade-offs you considered.

Good luck — we want you to succeed and look forward to seeing how you approach
the problem.
