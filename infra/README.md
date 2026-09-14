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

### What a strong answer notices

The three weaknesses are individually survivable but fatal together: the origin security group is open to `0.0.0.0/0` on the app port (so Cloudflare can be bypassed), the origin's only proof-of-edge is a **static, in-repo** shared header (so bypassing the edge is trivial once you read `main.tf`), and the instance role can read **every** secret in the account (so a foothold on the origin yields the token-signing key → forge any user's tokens). A weak answer just greps for `Resource = "*"` or says "make the bucket private."
