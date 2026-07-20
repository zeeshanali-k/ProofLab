# Trig Calculus, Indefinite Integration, and Canonical Completion

## Summary

Extend ProofLab’s FastAPI/SymPy verifier with trigonometric derivatives and restricted indefinite integrals. Add deterministic completion and final-form reveal only to task types with a single canonical target.

## Key changes

- Add `integral` mode and `antiderivative` claim kind. Support:
  - Derivatives of polynomials and `sin`, `cos`, `tan`, including polynomial-inner chain rules.
  - Repeated derivative notation such as `f''(x)`; each transition increments the derivative order.
  - Indefinite integrals of polynomials plus `sin(ax+b)` and `cos(ax+b)`, requiring `+ C`.
  - Keep tangent integration, trig identities, definite integrals, radicals, and variable denominators unsupported.

- Add problem-level terminal metadata:
  - `canonical` targets: first/repeated derivative tasks, complex simplification, complex solution sets.
  - `open-ended` targets: algebra transformations and indefinite integration.
  - Derivative problems declare their required terminal order; integration problems remain open-ended despite a valid antiderivative.

- Add `POST /assess-completion`, accepting the mode, given step, terminal learner step, and canonical-goal descriptor. Return only:
  - `complete` when the terminal step matches the deterministic target and every preceding transition is valid.
  - `in-progress` when a canonical task has not reached its target.
  - `needs-correction` when its proof chain contains an invalid or unchecked transition.
  - `not-applicable` for open-ended tasks.

- Add `POST /reveal-final-form` using the same safe parser and goal descriptor. It returns canonical LaTex only for eligible tasks; unsupported/open-ended modes are rejected. Verification responses must not add final-answer fields, preventing accidental answer disclosure.

- In the frontend:
  - Show a compact progress state for canonical tasks: **Complete**, **In progress**, or **Needs correction**.
  - Show **Reveal final form** from the start only for canonical tasks. Clicking it displays the deterministic final expression/set without modifying learner steps or marking the task complete.
  - Do not show a reveal button or completion verdict for algebra transformations or indefinite integration; retain their transition-by-transition verification.
  - Update the calculus composer, labels, inspector evidence, and repair flow for derivatives and antiderivatives.

## Tests

- Pytest coverage for polynomial/trig derivatives, chain-rule cases, repeated derivatives, valid/invalid antiderivatives, and missing `+C`.
- Completion and reveal API tests for derivative and complex tasks, including rejection for algebra and indefinite integration.
- Vitest coverage for status labels, conditional reveal-button visibility, and revealed-result rendering.
- Playwright flows for a completed derivative task, incomplete complex solution set, revealed canonical answer, and an integration task with no reveal control.

## Assumptions

- The reveal button is immediately available for eligible tasks.
- Initial eligible modes are derivative, complex simplification, and complex solving.
- Algebra and indefinite integration remain intentionally open-ended; explicit algebra “solve to final form” tasks can be added later as a separate mode.
