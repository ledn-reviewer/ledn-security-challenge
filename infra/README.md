# Module C (optional) — Cloud & identity review

You are handed a slice of the platform's infrastructure:

- [`main.tf`](./main.tf) — the Terraform for the API origin, its IAM role, and the token-signing secret.
- [`terraform-plan.txt`](./terraform-plan.txt) — a trimmed `plan` plus the app's runtime env.
- [`iam-policy-sim.json`](./iam-policy-sim.json) — effective-permissions snapshot for the instance role.

No AWS account is needed — this is a config review.

### Deliverable

1. **Attack path.** Describe, step by step, how an external attacker could reach customer data or the token-signing key. A single wildcard is not an answer — show the *interaction* of controls that makes the path reachable, and why the edge control does not stop it.
2. **Blast radius.** If the signing key is read, what can the attacker then do to the running API (tie it back to Modules A/B)?
3. **Fixes.** Concrete Terraform changes that close the path **without breaking legitimate Cloudflare→origin traffic**. Explain the migration order.
4. **Detection & containment.** One CloudTrail/edge signal you would alert on, and the immediate containment step.

We are interested in how the controls interact across the edge, origin, workload
identity, and application—not a list of isolated configuration smells. State
your assumptions and prioritize reachable paths with meaningful blast radius.
