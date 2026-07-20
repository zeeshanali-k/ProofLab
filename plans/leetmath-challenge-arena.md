# LeetMath: Math Challenge Arena

> This plan supersedes the earlier recommendation to keep LeetMath as only a later extension. LeetMath is now a distinct ProofLab section, while sharing the same deterministic verifier and visual-simulation foundation.

## 1. Product position

**LeetMath is a LeetCode-inspired math challenge arena.** It gives learners a crisp problem statement, constraints, a focused math workspace, and a single final submission. It is not a coding clone and does not pretend formulas have conventional input/output test cases.

The winning product angle is:

> **Don’t just check an answer—make it survive a mathematical reality check.**

Instead of test cases, a submitted solution is assessed through the appropriate deterministic mathematical contract:

| Challenge family | Acceptance method | Visual simulation |
| --- | --- | --- |
| Linear inequality | Equivalent solution region | Number line and boundary/direction |
| Quadratic roots | Complete solution set | Root markers on a parabola |
| Derivative | Symbolic derivative equivalence | Original and derivative curves |
| Antiderivative | Differentiate submitted answer and compare to integrand; require `+ C` | Integrand/derivative comparison |
| Complex arithmetic | Exact real and imaginary components | Argand plane |

LeetMath must remain fully deterministic. It uses no AI hints, repairs, explanations, or chat. An incorrect answer receives an acceptance verdict and format feedback only; it never exposes the expected formula or a hidden solution path.

## 2. Experience architecture

ProofLab has three clearly distinct experiences:

| Experience | Purpose | Verification feedback | AI help |
| --- | --- | --- | --- |
| **Guided** | Learn a method step by step | On after every transition | Available on demand |
| **Solo** | Work independently on the existing ProofLab problem library | Off until final submission | Disabled |
| **LeetMath** | Solve compact challenge problems in an arena-style interface | Final-submission verdict only | Disabled |

Guided and Solo are modes of the main ProofLab workspace. LeetMath is a separate section with its own problem list, workspace layout, and progression language.

## 3. Home and navigation

Replace the current immediate default-problem load with a lightweight launch screen.

### Home screen

Header: ProofLab logo, `Learn`, `LeetMath`, and a subtle progress indicator. Avoid a dashboard, long onboarding, or account requirement.

Primary content has two large ProofLab mode cards:

1. **Guided mode**
   - Caption: `Build your reasoning one step at a time.`
   - Shows: live transition checks, counterexamples, optional hints, repair drafts.
   - CTA: `Start guided problem`.

2. **Solo mode**
   - Caption: `Think first. Check once.`
   - Shows: the same proof-board and visual simulator, but no green/red transition feedback, hints, repair, reveal, or AI controls.
   - CTA: `Start solo problem`.

Below the two mode cards, add a wide LeetMath section card:

- Label: `LEETMATH · CHALLENGE ARENA`
- Headline: `Can your answer survive the simulation?`
- Description: `Short math challenges. One final submission. A deterministic reality check.`
- CTA: `Browse challenges`.
- Include a small preview of a number line, parabola, or Argand-plane visualizer—not a fake code editor.

### Navigation behavior

- `Learn` returns to the Guided/Solo home.
- `LeetMath` opens the challenge catalog.
- Preserve the current board state when a learner returns from a catalog to the same active challenge.
- No login, cloud persistence, leaderboard, daily notifications, or social feed in the first release.

## 4. Guided and Solo behavior

Add a shared `interactionMode` value to all main ProofLab sessions:

```text
interactionMode = "guided" | "solo"
```

### Guided mode

Keep current behavior unchanged:

- Verify every adjacent learner transition.
- Render valid, invalid, unsupported, and rechecking edge states.
- Allow evidence, hint, explanation, repair, canonical completion, and final-form reveal where supported.

### Solo mode

Solo is not merely Guided mode with buttons hidden.

- Store entered steps locally as neutral `draft` steps; do not call `/verify` per step.
- Keep the visualizer descriptive only: it may render the learner’s current expression, number line, curve, or complex point, but must not compare it with the answer target.
- Hide edge status labels, transition inspector evidence, hints, explanations, repair, and final-form reveal.
- Replace `Check step` with `Submit solution`.
- Submit only the final learner step and the task ID to the backend.
- After submission, return one deterministic verdict: `accepted`, `incorrect`, `format-error`, or `unsupported`.
- On success, unlock a concise “verified” simulation replay. On failure, retain learner work and allow another attempt without exposing the answer.

## 5. LeetMath section

### Challenge catalog

Use a compact LeetCode-like catalog, but retain ProofLab’s visual identity.

- Filters: `All`, `Algebra`, `Inequalities`, `Calculus`, `Complex`.
- Difficulty: `Foundation`, `Trap`, and `Chain`.
  - Foundation: one core operation.
  - Trap: one common misconception, such as a sign flip or dropped `+ C`.
  - Chain: two or more dependent mathematical moves.
- Challenge card content: number, title, topic, difficulty, expected answer shape, and a one-line simulation preview.
- Do not show an acceptance rate, user count, leaderboard, or timer in the first release.

### Challenge workspace

The workspace should echo a coding challenge layout without copying a code editor.

```text
┌───────────────────┬────────────────────────────────────┬──────────────────────┐
│ Challenge brief   │ Math workspace                     │ Reality simulator    │
│                   │                                    │                      │
│ #003 Sign Switch  │  MathLive answer field             │  Learner's number   │
│ Difficulty: Trap  │  Optional scratch steps            │  line / curve /      │
│                   │                                    │  complex plane       │
│ Constraints       │  [Reset]            [Submit]       │                      │
│ Answer shape      │                                    │  Neutral until       │
│                   │                                    │  final submission    │
└───────────────────┴────────────────────────────────────┴──────────────────────┘
```

Required sections in the challenge brief:

- Title and challenge number.
- Problem statement in plain language plus rendered mathematics.
- Constraints: supported notation, expected answer type, and whether a solution set or `+ C` is required.
- One illustrative example that teaches the answer format but is not the current challenge’s answer.
- A non-revealing note such as `Your answer is checked symbolically, not against memorized text.`

### Submission result

Use a modal or anchored result panel, never a chat response.

- **Accepted:** `Mathematical contract satisfied` plus a visual replay and a concise rule label.
- **Incorrect:** `Not accepted yet` plus only non-revealing format feedback where applicable, such as `Submit both roots inside braces.`
- **Format error:** show the exact accepted notation requirements.
- **Unsupported:** state that the challenge uses a not-yet-supported form and preserve the attempt.

No answer, repair, counterexample, canonical form, or AI-generated rationale is shown after a failed LeetMath submission.

## 6. Shared visualizer contract

Refactor the existing visual treatment into a reusable `MathSimulationPanel`. The panel must be display-only; the backend remains the source of mathematical truth.

```text
MathSimulationPanel
  input: visualization type + learner-safe render data + phase
  phase: draft | accepted | incorrect
  output: number line, curve, root plot, or Argand plane
```

Visualizer rules:

- In Guided mode, show verifier evidence and correct-vs-submitted comparison when a transition is invalid.
- In Solo mode, show only the learner-safe preview before submission.
- In LeetMath, show a neutral draft preview before submission; reveal verification overlay only after an accepted result.
- An incorrect LeetMath result must never render the canonical target, alternative roots, or a counterexample that materially gives away the answer.

Start with two visualizers only:

1. **Number line:** open/closed boundary and directional region for inequalities.
2. **Complex plane:** real and imaginary coordinates for complex arithmetic and roots.

Add the quadratic root plot and derivative curve only after the first two are stable.

## 7. Challenge definition and backend API

Move LeetMath challenge definitions to a backend registry. The frontend receives public metadata but never receives a canonical final expression or an acceptance comparator.

```text
ChallengeDefinition
  id, number, slug, title, topic, difficulty
  statementLatex, statementText, constraints, answerKind
  visualizerType, starterDraft, publicExample
  validatorKey, canonicalTarget (backend-only)
```

Add the following endpoints:

| Endpoint | Purpose |
| --- | --- |
| `GET /challenges` | Returns catalog-safe challenge metadata; never return canonical targets. |
| `GET /challenges/{id}` | Returns public statement, constraints, starter draft, and visualizer configuration. |
| `POST /challenges/{id}/preview` | Parses a draft and returns learner-safe visual data only. It never returns correctness or target-derived data. |
| `POST /challenges/{id}/submit` | Validates the final answer against the backend-only challenge contract and returns a verdict plus safe result metadata. |

`POST /challenges/{id}/submit` response shape:

```json
{
  "status": "accepted | incorrect | format-error | unsupported",
  "summary": "Short learner-facing result",
  "rule": "optional non-revealing acceptance rule",
  "visualization": {
    "type": "number-line | complex-plane",
    "phase": "accepted | incorrect",
    "learnerData": {}
  }
}
```

Do not use arbitrary generated test cases. Each validator uses the same safe parser and deterministic SymPy contract already used by the core product.

## 8. Initial LeetMath launch set

Launch with five hand-authored challenges that reuse existing verifier capability plus the new inequality mode.

| # | Title | Topic | Difficulty | Answer kind | Visualizer |
| --- | --- | --- | --- | --- | --- |
| 001 | Keep It Balanced | Linear algebra | Foundation | `x = value` | None initially |
| 002 | The Missing Middle | Quadratics | Trap | Equivalent equation | None initially |
| 003 | Sign Switch | Inequalities | Trap | Inequality | Number line |
| 004 | Differentiate the Chain | Calculus | Chain | `f'(x) = …` | Deferred curve |
| 005 | Both Roots Matter | Complex | Trap | Solution set | Complex plane |

These challenges are intentionally short and visually different. Do not add a large catalog until each has a polished submission and simulation experience.

## 9. Future progression and credits

Do not build virtual currency for the first LeetMath release. A credit system without a meaningful learner choice will feel artificial.

After the challenge loop is proven, add `Proof Points` with these rules:

- Award points only for accepted LeetMath challenges, not for repeated failed submissions.
- Award a small first-clear bonus and a larger no-reset bonus; do not make speed a requirement.
- Use points for optional challenge variants, visual themes, or a post-completion “why it works” replay.
- Never spend points to obtain basic learning access, hints, or correctness feedback.

Later additions, in order:

1. Topic and difficulty completion map.
2. Parameterized variants of accepted challenge templates.
3. Personal error-pattern review after a completed challenge, never during an active Solo attempt.
4. Optional daily three-challenge run, only after local persistence exists.

## 10. Implementation sequence

### Phase A — Experience selection

- Add the launch screen, Guided/Solo cards, and LeetMath navigation.
- Thread `interactionMode` through session state and the proof board.
- Preserve all existing Guided behavior and tests.

### Phase B — Solo submission path

- Add neutral draft steps and `Submit solution` behavior.
- Implement a server-side final-submission validator using existing canonical completion logic where eligible.
- Disable all AI and live verifier UI in Solo mode.

### Phase C — LeetMath catalog and contracts

- Add backend challenge registry, catalog/detail routes, safe preview route, and final submission route.
- Build catalog, challenge brief, MathLive workspace, submission panel, and retry/reset flows.
- Seed the five launch challenges.

### Phase D — Simulations

- Build `MathSimulationPanel` and number-line renderer first.
- Add complex-plane renderer second.
- Integrate visualizers into Guided evidence, Solo preview, and LeetMath submission results without leaking answer targets.

### Phase E — Hardening

- Add test coverage, empty/error states, keyboard handling, and responsive layout.
- Confirm all catalog metadata is public-safe and canonical targets remain backend-only.
- Defer points, challenge variants, accounts, timers, and leaderboards.

## 11. Test plan

### Backend

- Catalog routes never expose a canonical target.
- Preview accepts supported learner drafts and never returns an acceptance verdict.
- Submission accepts correct equivalent answers and rejects incorrect answers without returning the answer target.
- Format errors distinguish a malformed solution set, omitted `+ C`, and unsupported notation.
- Solo submissions never invoke a teaching provider.
- Guided endpoints retain their current behavior.

### Frontend

- Home selection enters Guided or Solo with the correct controls and copy.
- Solo hides every live status, hint, repair, explanation, and reveal affordance.
- LeetMath shows only public challenge metadata and a neutral simulator before submission.
- Accepted submission unlocks the simulation overlay; incorrect submission never displays a solution-derived visual.
- Keyboard users can navigate catalog filters, MathLive input, reset, and submit controls.

### End to end

- Guided quadratic flow still provides an invalid-edge counterexample and repair.
- Solo derivative flow records draft work, submits once, and receives only an end verdict.
- LeetMath `Sign Switch` accepts the correct inequality and renders its number line.
- LeetMath `Both Roots Matter` rejects a one-root solution set without disclosing the missing root.

## 12. Decisions and boundaries

- LeetMath is visually inspired by coding challenge products, but it uses mathematical contracts and simulations instead of test cases.
- Guided/Solo are core ProofLab modes; LeetMath is its own section.
- Deterministic verification is mandatory. AI remains completely off in Solo and LeetMath.
- No test-case engine, leaderboard, timer, credits, account system, or daily challenges in the first release.
- The first visualizer work is number lines and complex planes; graphs for derivatives and quadratics are intentional follow-up work.
