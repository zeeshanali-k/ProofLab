# ProofLab implementation plan

> **Implementation update — calculus and complex numbers:** The original algebra-only MVP below has been extended. ProofLab now uses a single FastAPI/SymPy backend (not Next.js API routes or Math.js), retains Ollama/OpenAI-compatible/local teaching-provider selection in Python, and adds task-scoped polynomial derivative, complex-simplification, and simple imaginary-root workflows. Where this historical plan conflicts with the current README, the README and FastAPI OpenAPI contract are authoritative.

## 1. Product definition

ProofLab is a visual algebra-reasoning debugger for students roughly aged 13–18. Students enter a sequence of algebra steps and see each step as a card in a connected reasoning chain. ProofLab verifies each transition, identifies the first invalid transition, shows concrete evidence, and offers an optional AI hint, explanation, or repair.

The product is **not** a generic AI chat app, document editor, handwriting recognizer, or all-purpose computer algebra system.

### Demo outcome

The submission demo must show this exact path:

1. Enter `(x + 2)^2 = 25`.
2. Enter the incorrect expansion `x^2 + 4 = 25`.
3. See the connecting edge turn red and receive `x = 3` as a counterexample.
4. Request a hint or explanation.
5. Repair the step to `x^2 + 4x + 4 = 25`.
6. See the edge turn green, then add `x^2 + 4x - 21 = 0` as a valid next step.

## 2. MVP scope and boundaries

### In scope

- Typed equation entry with MathLive.
- KaTeX display on readable step cards.
- A linear connected reasoning graph (cards may be visually arranged as a graph; branching is deferred).
- One variable, `x`, with integer/rational constants.
- Linear and quadratic polynomial algebra only.
- Verification of supported transformations:
  - expansion of brackets, especially `(x + a)^2`;
  - collecting like terms;
  - adding/subtracting the same expression on both sides;
  - multiplying/dividing both sides by a known non-zero numeric constant;
  - rearranging an equation;
  - checking a proposed numeric solution by substitution.
- Evidence-first results: valid, invalid with counterexample, unsupported, or inconclusive.
- GPT-5.6 explanations, hints, and repair suggestions only after an explicit user action.
- Editing a step invalidates and rechecks every later transition.

### Explicitly out of scope

- Handwriting, image upload, camera input, OCR, or Excalidraw.
- General calculus, matrices, inequalities, trigonometry, complex numbers, multiple variables, or arbitrary proofs.
- Real-time collaboration, accounts, progress tracking, teacher dashboards, payments, exports, and notifications.
- A persistent chat sidebar or unrestricted question-answer interface.
- Claiming that an unsupported expression was verified.

## 3. Architecture

The browser speaks only to Next.js API routes. Verification is intentionally behind a provider interface, so moving from Math.js to SymPy does not affect the client, data model, or UI.

```text
Next.js / React client
  ├─ MathLive input and KaTeX display
  ├─ React Flow reasoning chain
  └─ calls /api/verify and /api/explain
             │
             ▼
Next.js server routes
  ├─ VerificationProvider interface
  │    ├─ MathJsVerifier (MVP, in-process)
  │    └─ SympyVerifier (future HTTP adapter)
  └─ GPT-5.6 explanation route
             │
             ▼
Verified evidence returned to the UI
```

### Recommended stack

| Area | Choice | Why |
|---|---|---|
| Application | Next.js App Router, TypeScript | One deployable codebase and thin server routes on Vercel. |
| UI | React, Tailwind CSS, shadcn/ui | Rapid, polished component work. |
| Equation entry | MathLive | Structured math input and editable LaTeX. |
| Equation display | KaTeX | Fast, consistent rendering on cards and evidence panels. |
| Graph | React Flow | Nodes, custom edges, and clear red/green transition states. |
| State | Zustand or React `useReducer` | Small, predictable board state; no database needed for MVP. |
| Verification | Math.js in the Next.js server | JavaScript-only MVP with no second deployed service. |
| AI | OpenAI Responses API using GPT-5.6 | Hint/explanation/repair generation, constrained by verified evidence. |
| Tests | Vitest + Playwright | Unit-test algebra decisions and test the demo flow end to end. |

## 4. Project structure

```text
app/
  page.tsx                         # ProofLab board
  api/verify/route.ts              # Provider-backed verification endpoint
  api/explain/route.ts             # GPT-5.6 endpoint
components/
  board/proof-board.tsx
  board/step-card.tsx
  board/transition-edge.tsx
  board/add-step-dialog.tsx
  math/equation-field.tsx
  math/equation-render.tsx
  inspector/transition-inspector.tsx
  inspector/counterexample-card.tsx
  inspector/ai-help-panel.tsx
lib/
  domain/types.ts
  equation/codec.ts
  equation/validation.ts
  verification/provider.ts
  verification/mathjs-verifier.ts
  verification/sympy-verifier.ts   # Stub/interface test only in MVP
  verification/transform-rules.ts
  verification/counterexamples.ts
  ai/explanation-prompt.ts
stores/proof-store.ts
tests/
  unit/verification/
  e2e/demo-flow.spec.ts
```

## 5. Core contracts

Keep these types independent of Math.js, GPT, React Flow, and any future Python service.

```ts
export type StepStatus = 'root' | 'checking' | 'valid' | 'invalid' | 'unsupported' | 'inconclusive'

export interface ProofStep {
  id: string
  order: number
  latex: string
  canonical: string
  status: StepStatus
}

export type VerificationStatus = 'valid' | 'invalid' | 'unsupported' | 'inconclusive'

export interface Counterexample {
  variable: 'x'
  value: number
  previousLeft: number
  previousRight: number
  nextLeft: number
  nextRight: number
}

export interface VerificationResult {
  status: VerificationStatus
  rule?: 'expand-square' | 'equivalent-rearrangement' | 'balance-operation' | 'solution-substitution'
  summary: string
  counterexample?: Counterexample
  likelyMissingTerm?: string
  verifiedRepairLatex?: string
  limitations?: string[]
}

export interface VerificationProvider {
  verifyTransition(previous: ProofStep, next: ProofStep): Promise<VerificationResult>
}
```

### Route contracts

`POST /api/verify`

```json
{
  "previousStep": { "id": "step-1", "latex": "(x+2)^2=25", "canonical": "(x+2)^2=25" },
  "nextStep": { "id": "step-2", "latex": "x^2+4=25", "canonical": "x^2+4=25" }
}
```

`POST /api/explain`

```json
{
  "previousStep": "(x+2)^2=25",
  "nextStep": "x^2+4=25",
  "verification": {
    "status": "invalid",
    "summary": "The expanded expressions are not equivalent.",
    "counterexample": { "variable": "x", "value": 3 },
    "likelyMissingTerm": "4x"
  },
  "mode": "hint"
}
```

Allowed `mode` values are `hint`, `explain`, and `repair`. The API returns short structured content, not open-ended conversation history.

## 6. Equation handling and safety

Each equation exists in two forms:

- `latex`: the exact MathLive output used for display and editing.
- `canonical`: a restricted, parser-safe algebra form used by the verifier.

Build an `EquationCodec` that:

1. Takes MathLive output.
2. Normalizes multiplication, powers, fractions, parentheses, and the equality sign.
3. Rejects any token outside the MVP grammar.
4. Produces a canonical expression that Math.js can parse.

Allowed syntax: `x`, integer/rational constants, `+`, `-`, `*`, `/`, `^`, parentheses, and exactly one `=`. Reject function calls, assignment, arrays, units, other variables, and all identifiers except `x`.

Never pass raw user strings to JavaScript evaluation or Python `eval`. The verifier must parse only the restricted grammar and return `unsupported` when parsing or scope validation fails.

## 7. Math.js verifier design

The MVP verifier is a **limited algebra verifier**, not a general symbolic theorem prover. Its result states must be honest:

- `valid`: a supported rule has been deterministically confirmed.
- `invalid`: a concrete counterexample has been found.
- `unsupported`: outside the published MVP algebra scope.
- `inconclusive`: inside the syntax scope but not confidently classified by the Math.js implementation; do not mark it green.

### Verification algorithm

1. Parse both equations into left and right expressions.
2. Validate they use only supported syntax and remain degree two or lower.
3. Compute residual expressions: `previousLeft - previousRight` and `nextLeft - nextRight`.
4. Try supported-rule detectors in this order:
   - `expand-square`: recognize `(x + a)^2` or `(x - a)^2` and compare against the expected expanded polynomial;
   - `equivalent-rearrangement`: compare normalized residuals, allowing sign reversal;
   - `balance-operation`: detect the same term being added/subtracted on both sides, or a non-zero numeric scale factor;
   - `solution-substitution`: when a user enters `x = number`, substitute into the previous equation.
5. For valid rules, return the matching rule and a concise proof label.
6. For an invalid comparison, test deterministic values from `[-7, -3, -2, -1, 0, 1, 2, 3, 7]`, then additional safe values as required. Return the first value that satisfies one relationship but not the other, or makes the two transformed expressions differ.
7. For the square-expansion rule, compare expected and entered terms to surface a likely missing term such as `4x`.
8. If neither a supported proof nor an invalid counterexample is found, return `inconclusive`.

For the demo, `(x + 2)^2 = 25` and `x^2 + 4 = 25` must deterministically return the counterexample `x = 3` and `likelyMissingTerm: "4x"`.

### Future SymPy migration

Do not change `ProofStep`, `VerificationResult`, routes, or UI when Math.js becomes insufficient.

Implement `SympyVerifier` as an HTTP adapter that calls a private Python service with the same request and response contract. Select the implementation through `VERIFIER_PROVIDER=mathjs|sympy`. The Next.js `/api/verify` route remains the sole browser-facing endpoint.

Migration triggers:

- repeated `inconclusive` results for supported quadratic transformations;
- a need for exact solution-set comparison beyond the current rules;
- a need for more reliable factorization, rational expressions, or symbolic assumptions.

## 8. AI behavior

GPT-5.6 is a teaching layer, never the authority for correctness.

### Rules

- Call GPT only after the user clicks Hint, Explain, or Repair.
- Include the verified result, counterexample, and known term/rule in every request.
- Do not ask the model to independently decide whether a transition is valid.
- Require concise JSON output: `title`, `body`, `question`, and optional `repairLatex`.
- A repair suggestion is shown as a draft. It becomes a green step only after `/api/verify` validates it.
- Hint mode must not reveal the full corrected equation.
- Explain mode may show the full reasoning and counterexample.

### Prompt intent

System instruction: *You are ProofLab's algebra coach. Use only the supplied verification evidence. Be encouraging, concise, age-appropriate, and specific to the exact transition. Never claim a step was verified unless the evidence says `valid`.*

## 9. Frontend behavior

### Board state transitions

1. The root step has no incoming transition and is labelled `Given`.
2. On adding or editing a step, mark it `checking`; mark all later steps `checking` as well.
3. Call `/api/verify` for every adjacent pair from the edited step forward, sequentially.
4. Stop automatic downstream validation after the first invalid, unsupported, or inconclusive edge. Later cards show `Needs rechecking`.
5. Persist the results in client state so opening an explanation does not repeat verification.
6. On a successful repair, replace only the selected step and re-run its descendants.

### UI states

- Green edge: valid transition, concise rule label.
- Red edge: invalid transition, counterexample available.
- Amber edge: unsupported or inconclusive; never present this as a user mistake.
- Grey edge: awaiting a previous step or recheck.
- Explanation inspector: anchored to the selected edge; no global chat feed.

## 10. Implementation milestones

### Milestone 1 — Foundation

- Scaffold Next.js TypeScript application, Tailwind, shadcn/ui, and lint/test configuration.
- Add MathLive field and KaTeX renderer.
- Create `ProofStep`, `VerificationResult`, and board store.
- Render static demo cards and custom React Flow edges.

**Done when:** a user can enter, edit, and delete a sequence of LaTeX equation cards.

### Milestone 2 — API boundary and verifier

- Build the restricted `EquationCodec`.
- Add `VerificationProvider`, `MathJsVerifier`, and `/api/verify`.
- Implement the four MVP rule detectors and counterexample generator.
- Add unit tests for valid/invalid/unsupported/inconclusive results.

**Done when:** the sample mistake yields a red edge, `x = 3`, and `4x`; the repaired expansion yields a green edge.

### Milestone 3 — Interactive reasoning chain

- Connect add/edit events to sequential downstream rechecking.
- Implement status styles, edge labels, and selected-edge inspector.
- Show the evidence card before any AI action.
- Add the valid rearrangement and invalid solution examples.

**Done when:** changing Step 2 correctly changes the state of all later cards.

### Milestone 4 — GPT teaching layer

- Add `/api/explain`; keep the OpenAI key server-side.
- Implement strict structured outputs for Hint, Explain, and Repair.
- Show replies in the selected transition inspector.
- Re-verify all accepted repair suggestions.

**Done when:** a hint reveals only a guiding question and an explanation references the verified `x = 3` evidence.

### Milestone 5 — Demo quality

- Preload the full demo problem as an optional guided example.
- Add empty, loading, API error, unsupported, and inconclusive states.
- Improve keyboard navigation and mobile fallback.
- Run tests, record the demo, and complete the README.

**Done when:** a fresh visitor can finish the showcased flow without a setup decision or an unexplained failure.

## 11. Test plan

### Unit tests

- Codec accepts valid quadratic syntax and rejects unsupported syntax.
- `(x+2)^2 = 25` → `x^2+4x+4 = 25` is valid.
- `(x+2)^2 = 25` → `x^2+4 = 25` is invalid, gives `x=3`, and exposes `4x`.
- `x^2+4x+4 = 25` → `x^2+4x-21 = 0` is valid.
- `x^2+4x-21 = 0` → `x = 7` is invalid by substitution.
- Integral input returns `unsupported`.
- A repair proposed by AI is never accepted before verification.

### End-to-end test

Use Playwright to run the complete demo path: add root, add mistake, inspect red evidence, request a mocked explanation, edit repair, confirm green edge, and add the rearrangement.

## 12. Launch checklist

- `OPENAI_API_KEY` is configured only on the server/deployment platform.
- `VERIFIER_PROVIDER=mathjs` is explicit in environment configuration.
- Unsupported and inconclusive labels are visible and understandable.
- The README explains setup, MVP scope, architecture, test commands, and how Codex accelerated development.
- The video shows the working product before describing implementation.
- The hackathon submission includes the requested Codex feedback session ID.
