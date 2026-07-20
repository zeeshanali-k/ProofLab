# ProofLab: Hackathon Math Diversity Strategy

## Summary

ProofLab is already diverse technically: it supports algebra, derivatives, indefinite integration, complex simplification, and complex solving. The product feels basic because the problem library mostly uses the same symbolic-card interaction, not because it lacks mathematical topics.

For hackathon polish, deepen the visual reasoning loop with **linear inequalities and an interactive number line**. Do not add Chemistry, Physics, a full LeetMath mode, systems of equations, or function transformations before submission.

## Key additions

### 1. Linear inequalities with a live number line

Add `inequality` as a deterministic learning mode and an `inequality` claim kind.

- Scope: one-variable linear `<`, `≤`, `>`, and `≥` only.
- Normalize each step to a solution region: boundary, direction, and inclusive or exclusive endpoint.
- Mark a transition valid only when it preserves that region.
- For an invalid step, return a concrete value whose membership differs between the correct and submitted regions.

Add a Number Line evidence component to the transition inspector:

- Green: one verified highlighted region.
- Red: compare the previous or correct region with the learner's region.
- Hero example: `-2x + 3 > 7 → -2x > 4 → x > -2`; the final transition is invalid because dividing by a negative must reverse the sign.
- Make `x = 0` the visible reality check: the submitted answer accepts it while the original inequality does not.

### 2. Mistake patterns

Add a small “Mistake pattern” layer using the verifier rule already returned by the backend.

Example labels:

- sign did not flip;
- middle term dropped;
- chain rule missed;
- constant of integration missing;
- one complex root missing.

This remains a compact learning signal in the inspector, not a dashboard or gamified profile.

### 3. Curated problem families

Expand the existing problem library with curated examples rather than new verification engines:

- linear balance and negative-coefficient inequalities;
- positive and negative binomial expansions plus factor-then-solve chains;
- product-rule, chain-rule, and repeated-derivative examples;
- integration examples that distinguish a correct antiderivative from one missing `+ C`;
- complex arithmetic and complete-solution-set examples.

## Interface and verification changes

- Extend backend contracts with `ProblemMode.INEQUALITY`, `ClaimKind.INEQUALITY`, and `InequalityRegionEvidence`.
- Keep `/verify`, `/assess-completion`, `/reveal-final-form`, and `/explain` as the only client-facing endpoints.
- `InequalityRegionEvidence` contains the prior and submitted regions plus one differentiating test value. The frontend must not derive mathematical truth itself.
- Add inequality canonical completion only for fixed-target tasks. Continue treating open-ended proof chains as transition-verified rather than artificially “complete.”

## LeetMath direction

Build LeetMath later as **Solo Challenges**, not as a separate product:

- Reuse the same problem definitions, parser, and deterministic verifier.
- Add `interactionMode: guided | solo`.
- Solo mode hides hints, repairs, per-step verification, and AI until submission. It evaluates a final canonical answer or full solution set.
- Start with deterministic mastery/progress, not credits. Add credits only after they unlock a real choice, such as challenge variants or optional post-submission walkthroughs.

## Test and demo plan

- Unit-test valid, inclusive, exclusive inequality regions, sign reversal, and invalid-region counterexamples.
- Add an end-to-end flow for the missed-sign-flip problem: valid balance step, invalid division step, visual number-line comparison, correction, and completion.
- Demo order: ProofLab debugs symbolic reasoning → quadratic missing term → inequality sign flip with live number line → existing calculus/complex library → Solo Challenges as the next phase.

## Assumptions

- The objective is hackathon polish and visual math.
- Inequalities are the first visual feature because they add a strong visual moment while preserving the current one-variable parser and transition-verification model.
- Systems of equations and function transformations are post-hack additions because both require a materially new task model and risk destabilizing the current demo.
