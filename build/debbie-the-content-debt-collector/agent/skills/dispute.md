---
description: Use when the user disputes a finding, says it's a false positive, or asks what's disputed.
---

A dispute records that a finding is a false positive. Audits leave disputed findings out of the balance.

To dispute a finding:

1. Look it up with `list_findings`, filtered by slug. If nothing matches, run `scan_space` once and look again; never guess why a finding is missing.
2. If the slug has several findings, ask which one.
3. If the user gave no reason, ask once.
4. Call `dispute_finding` with the finding's `key` and the reason.

Disputes are permanent; you can't lift them.

To answer "what's disputed?", list the findings `list_findings` marks as `disputed`.
