# ProofLab

ProofLab is an interactive learning platform with focused Math, Chemistry, Physics, and Biology labs. Math now includes a visual-first Foundations lab for number and quantity practice, alongside Guided ProofLab for symbolic reasoning and LeetMath for deterministic final-answer challenges.

The product deliberately separates deterministic mathematical verification from optional AI teaching. SymPy-backed checks decide whether a transition is valid; a teaching provider can explain the already-verified result, offer a hint, or suggest a repair that ProofLab verifies again before applying.

## What it does

- Offers four focused learning labs from one shared navigation bar: Math, Chemistry, Physics, and Biology.
- Includes **Math Foundations**: 10 modules and 20 activities covering place value, integers, fractions, decimals, percentages, ratios, units, estimation, and everyday USD money math.
- Uses interactive number lines, place-value blocks, fraction bars, and ratio tables before a learner submits a deterministic quantity answer.
- Requires an account for Math progress and keeps account-owned XP, streaks, mastery, and resumable Foundation practice instances.
- Provides a platform Guide that explains each lab and returns learners to the module or nested tool they opened it from.
- Includes Chemistry tools for equation balancing, molar mass, 3D molecules, stoichiometry, solutions, thermochemistry, equilibrium, electrochemistry, and molecular geometry.
- Includes Physics formula exploration and simulations for kinematics, projectile motion, energy, vectors, simple harmonic motion, and circuits.
- Includes Biology explorations for anatomy, body regions, organ systems, chromosomes, inheritance, evolution, and ecology.
- Builds an editable, step-by-step reasoning path with MathLive equation inputs and KaTeX rendering.
- Verifies algebra transformations, one-variable linear inequalities, polynomial/trigonometric derivatives, restricted indefinite integrals, complex simplification, and simple complex solution sets.
- Rechecks each later transition after a learner edits an earlier step, stopping at the first transition that cannot be verified.
- Shows concrete counterexamples or comparison evidence for applicable invalid transitions.
- Draws server-derived inequality regions on a live number line, including open/closed endpoints and a concrete differentiating value for invalid transitions.
- Gives specific derivative-order coaching for repeated-derivative mistakes, such as submitting a second `f'(x)` instead of `f''(x)`, without immediately revealing the corrected derivative.
- Tracks canonical completion for fixed-target inequalities, derivative, and complex-number tasks and can reveal a canonical final form without altering learner work.
- Keeps algebra transformations, indefinite integration, and non-canonical inequality chains intentionally open-ended, with transition-by-transition checking only.
- Includes a per-solution **Rough board**: an Excalidraw scratch canvas that opens as a modal without changing the current route or solution.
- Persists each rough board locally by proof problem or LeetMath challenge, so drawings survive closing the modal, reloads, and answer-draft resets.
- Adds **LeetMath**, a 30-challenge final-answer arena with topic filters, deterministic previews, visual replays for supported answers, and account-owned submission history.

## Learning labs

| Lab | Route | What you can explore |
| --- | --- | --- |
| **Math Foundations** | `/math/foundations` | Visual-first number and quantity practice. Each of the 10 modules has a guided visual mission and a seeded practice activity. |
| **Guided ProofLab** | `/math` | Checked algebra, inequality, calculus, and complex-number reasoning paths. |
| **LeetMath** | `/leetmath` | Deterministic final-answer challenges with supported visual replays. |
| **Chemistry Lab** | `/chemistry` | Equation balancing, molar mass, 3D molecular viewing, stoichiometry, solution chemistry, thermochemistry, equilibrium, electrochemistry, and molecular geometry. |
| **Physics Lab** | `/physics` | Formula visualizations and simulations for motion, energy, vectors, simple harmonic motion, and circuits. |
| **Biology Lab** | `/biology` | Anatomy and body-region views, organ systems, chromosomes, inheritance, phylogeny, and ecology cycles. |

The shared navigation provides the current lab, theme control, and **Guide** entry point on every screen. Nested lab tools include a Back link to their parent dashboard or parent section.

## Tech stack

| Area | Technology |
| --- | --- |
| Web application | Next.js 16, React 19, JavaScript/JSX, and TypeScript/TSX |
| Math input, rendering, and rough work | MathLive, KaTeX, and Excalidraw |
| Verification API | Python 3.11+, FastAPI, Pydantic, Uvicorn |
| Symbolic mathematics | SymPy with a restricted, custom LaTeX-like parser |
| Teaching providers | Local deterministic fallback, Ollama, or any Chat Completions-compatible API |
| Python dependency management | uv |
| Frontend quality checks | ESLint and Vitest |
| End-to-end tests | Playwright |
| Container development | Docker and Docker Compose |

## Architecture

The Next.js application is frontend-only. It calls one FastAPI service directly from the browser.

```text
Next.js learning labs
        │
        ├── Math Foundations ─────────────┐
        │   ├── GET /curriculum ──────────┤
        │   ├── GET/POST /practice/* ─────┤
        │   └── account progress ─────────┤
        ├── Guided ProofLab + LeetMath ───┤
        │   ├── POST /verify ────────────┤
        │   ├── POST /assess-completion ─┼── FastAPI ── restricted parser ── SymPy
        │   ├── POST /reveal-final-form ─┤
        │   └── GET/POST /challenges/* ──┘
        ├── Chemistry Lab ─────────────── browser-side calculators and visualizers
        ├── Physics Lab ───────────────── browser-side simulations and charts
        └── Biology Lab ───────────────── browser-side interactive explorers
```

The FastAPI service owns authentication, curriculum metadata, generated practice seeds, private answer comparators, submissions, and progress. The browser receives learner-safe practice prompts and feedback only; it never receives the seed or canonical answer. Math Lab also uses `POST /explain` with Ollama, an OpenAI-compatible API, or the local fallback for optional teaching content.

The verifier never evaluates arbitrary learner input. The parser only accepts the published grammar for each task, then constructs safe SymPy expressions. Provider credentials and symbolic-engine access stay on the backend; the browser receives only verification results and teaching content.

## Repository layout

```text
app/                         Next.js routes for Math Foundations, Guided ProofLab, Chemistry, Physics, Biology, Guide, and LeetMath
src/                         React workspaces, Foundations visualizers, science visualizers, Excalidraw rough board, API clients, styling
backend/prooflab_api/        FastAPI routes, authentication, curriculum, seeded practice engine, progress, parser, verifier, teaching providers
backend/tests/               Pytest API and verifier coverage
tests/unit/                  Vitest component and client coverage
tests/e2e/                   Playwright learner flows
docker-compose.yml           FastAPI development container
```

## Quick start

### Prerequisites

- Node.js 20 or later and npm
- Either [uv](https://docs.astral.sh/uv/) for local Python development or Docker Desktop for the backend container

### 1. Configure local environment variables

Copy the example and adjust values as needed:

```bash
cp .env.example .env
```

The backend loads `.env`; Next.js also loads it for browser-safe `NEXT_PUBLIC_` values. Use `.env.local` only for frontend-specific overrides such as `NEXT_PUBLIC_PROOFLAB_API_URL`. The Docker Compose backend defaults to the offline `local` teaching provider, so it runs without an LLM.

### 2. Start the FastAPI backend

Use one of the following options.

**Local uv workflow**

```bash
cd backend
uv sync
uv run uvicorn prooflab_api.main:app --reload --host 127.0.0.1 --port 8000
```

**Docker Compose workflow**

```bash
docker compose up --build
```

The API health check is available at [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health), and FastAPI’s interactive OpenAPI documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 3. Start the frontend

In a second terminal at the repository root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Labs, workspaces, and rough work

Use the shared navigation to switch between **Math**, **Chemistry**, **Physics**, and **Biology**. The **Guide** button explains the available tools and keeps a return link to the screen that opened it. In Math, use the workspace tabs to switch between **Foundations**, the guided **ProofLab** reasoning board, and the final-answer **LeetMath** arena.

Math Foundations has 10 modules and 20 activities. Select a module, then choose its guided visual mission or seeded practice activity. Number lines, place-value blocks, fraction bars, and ratio tables help you model the problem before you enter or select an answer. **Check model** provides deterministic feedback without recording completion; **Submit answer** records the attempt. A completed template may be restarted for extra practice, but XP and mastery credit are awarded once per template. Completing both activities masters a Foundations module.

LeetMath currently contains 30 deterministic challenges across Algebra, Inequalities, Calculus, and Complex numbers. Some answer types display a number-line or complex-plane replay as the answer is drafted or submitted.

Both workspaces include a **Rough board** directly above the active work area. It opens a near-full-screen Excalidraw modal, so the URL, solution, draft answer, and visualizer state stay in place. The board supports Excalidraw's core selection, freehand, shapes, arrows, text, eraser, undo, and redo tools.

- Each proof problem uses `prooflab:rough-work:v1:proof:<problemId>` in browser local storage; each LeetMath challenge uses `prooflab:rough-work:v1:leetmath:<challengeId>`.
- The stored scene contains drawing elements and durable canvas preferences only. Viewport position, selections, dialogs, and cursors are not restored.
- Use **Empty board** at the far right of the canvas to clear the current board. When it contains work, ProofLab asks for confirmation first.
- Rough boards are private to the current browser and device. They are not uploaded, shared, or included in submission history.

## Environment configuration

The backend reads environment files in this order: repository `.env`, `backend/.env`, then `backend/prooflab_api/.env`. Values exported by the shell, Docker, or deployment environment always take precedence.

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_PROOFLAB_API_URL` | Browser-visible FastAPI base URL | `http://127.0.0.1:8000` |
| `FRONTEND_ORIGIN` | Comma-separated CORS allowlist | `http://localhost:3000` |
| `PROOFLAB_DATABASE_PATH` | SQLite database path for accounts, progress, and practice instances | `backend/data/prooflab.db` |
| `AI_PROVIDER` | `local`, `ollama`, or `openai-compatible` | `ollama` locally; `local` in Docker Compose |
| `AI_TIMEOUT_MS` | Teaching-provider request timeout | `20000` |
| `OLLAMA_BASE_URL` / `OLLAMA_MODEL` | Ollama endpoint and model | `http://127.0.0.1:11434` / `llama3.2:3b` |
| `OPENAI_COMPATIBLE_BASE_URL` / `OPENAI_COMPATIBLE_MODEL` | Chat Completions-compatible endpoint and model | Required for that provider |
| `OPENAI_COMPATIBLE_API_KEY` | Server-side credential for a compatible provider | Optional, provider-dependent |

Never expose `OPENAI_COMPATIBLE_API_KEY` through a `NEXT_PUBLIC_` variable or commit it to source control.

## Learning modes and verifier scope

ProofLab supports a deliberately constrained grammar. Unsupported notation produces an explicit `unsupported` result instead of a potentially misleading answer.

| Mode | Supported work |
| --- | --- |
| **Algebra** | One-variable linear and quadratic equation transformations, square expansion, balance operations, equivalent rearrangements, and proposed-solution substitution. |
| **Inequality** | One-variable linear `<`, `≤`, `>`, and `≥` transformations. Each step is normalized to a half-line; invalid transitions return the prior and submitted regions plus a test value for the number line. |
| **Derivative** | Polynomial derivatives plus `sin`, `cos`, and `tan` with polynomial inner functions. Supports `f'(x)`, `f''(x)`, and later repeated-prime notation; each transition must advance by exactly one derivative order. |
| **Indefinite integral** | Polynomials plus `sin(ax+b)` and `cos(ax+b)`. Learners enter `\int … \, dx` and must submit `F(x) = … + C`. |
| **Complex simplify** | Rational rectangular-form arithmetic using `i`. |
| **Complex solve** | Simple monic equations of the form `x^2 + c = 0` that have rational imaginary roots, entered as a complete solution set such as `\{2i, -2i\}`. |

The current verifier intentionally does not support tangent integration, trigonometric-identity transformations, definite integrals, radicals, variable denominators, polar form, arbitrary complex quadratics, or arbitrary natural-language math questions.

### Derivative-order feedback

For an order mismatch—repeating `f'`, skipping to `f''`, or moving backwards—the verifier marks the transition **invalid** with the `derivative-order` rule. It identifies the required next notation and, where relevant, prompts the product and chain rules. This automatic response does not include a sampled comparison, expected expression, or deterministic repair, so the learner can attempt the corrected step independently.

## Canonical completion and final-form reveal

Problems may define a canonical goal. Currently, this applies to fixed-target inequalities, derivatives, complex simplification, and complex solution sets.

- **Complete** means every submitted transition is valid and the terminal step equals the deterministic target.
- **In progress** means the proof chain is valid but has not reached that target.
- **Needs correction** means a transition is invalid or cannot be checked.
- **Reveal final form** is available from the start for canonical tasks. It displays the deterministic result without editing learner steps or changing completion state.

Algebra and indefinite integration have no canonical target. Inequality chains also remain open-ended unless a problem explicitly supplies its fixed target. These tasks intentionally do not show a completion verdict or final-form reveal control.

## API overview

FastAPI publishes the complete OpenAPI schema at `/openapi.json` and interactive documentation at `/docs`.

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Reports service readiness. |
| `POST /verify` | Verifies a single transition from `previousStep` to `nextStep` for a learning `mode`. Returns `valid`, `invalid`, `unsupported`, or `inconclusive`, plus a rule, summary, and applicable evidence. |
| `POST /assess-completion` | Evaluates a full learner chain against a problem-defined canonical goal. Returns only `complete`, `in-progress`, `needs-correction`, or `not-applicable`. |
| `POST /reveal-final-form` | Returns canonical LaTeX only for eligible tasks. Open-ended and unsupported modes are rejected. |
| `POST /explain` | Requests an optional hint, explanation, or repair based on a verification result already decided by the verifier. |
| `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` | Creates, starts, or ends an authenticated account session. |
| `GET /me/dashboard` | Returns account XP, streak, mastery, recent activities, and achievements. |
| `GET /curriculum`, `GET /curriculum/{nodeId}` | Returns learner-safe curriculum modules, activities, and guided missions. |
| `POST /practice/next` | Creates or restores the one active seeded Foundations instance for a template; `restart` creates a fresh instance. |
| `GET /practice/{instanceId}` | Restores an owned, learner-safe practice instance. |
| `POST /practice/{instanceId}/verify` | Checks a draft Foundations response without recording completion. |
| `POST /practice/{instanceId}/submit` | Records a Foundations response and awards eligible XP/mastery on success. |
| `GET /challenges` | Returns the LeetMath challenge catalog. |
| `GET /challenges/{challengeId}` | Returns the full prompt, constraints, answer shape, and visualizer configuration for one challenge. |
| `POST /challenges/{challengeId}/preview` | Parses a draft final answer and returns its deterministic visual preview when supported. |
| `POST /challenges/{challengeId}/submit` | Checks and records one final answer for the signed-in learner. |
| `GET /challenges/{challengeId}/submissions` | Returns the signed-in learner's submission history. |

All proof-step payloads contain an `id`, `latex`, and task-scoped `kind`. The supported modes are `algebra`, `inequality`, `derivative`, `integral`, `complex-simplify`, and `complex-solve`.

## Teaching providers

`POST /explain` never determines mathematical correctness. It receives the submitted steps and verifier output, then returns concise structured teaching content.

### Offline local fallback

```bash
AI_PROVIDER=local
```

Use this for demos and tests without a model server. It provides deterministic, evidence-based copy.

### Ollama

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

Run Ollama locally and pull the configured model before requesting teaching help.

### OpenAI-compatible Chat Completions API

```bash
AI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_BASE_URL=https://your-provider.example/v1
OPENAI_COMPATIBLE_MODEL=your-model-id
OPENAI_COMPATIBLE_API_KEY=server-only-secret
```

Repairs remain drafts: ProofLab re-verifies them before any learner step is replaced.

## Testing and quality checks

Run these commands from the repository root:

```bash
# Static checks and frontend unit tests
npm run lint
npm run test:unit

# FastAPI and SymPy verifier tests
npm run test:api

# Production frontend build
npm run build

# Browser flows; start the FastAPI service first
npm run test:e2e
```

The test suite covers authentication, curriculum metadata, all 20 seeded Foundations templates, private-answer boundaries, resume/restart behavior, XP/mastery rules, restricted parsing and verification, trigonometric and repeated derivatives, integration with `+ C`, canonical completion/reveal behavior, local rough-board storage and malformed-data recovery, LeetMath challenge checks, UI status and reveal rendering, and end-to-end learner flows including Foundations practice and drawing persistence across reloads.

## Current product boundaries

- **Math Foundations** deliberately covers its published quantity and money scenarios only. It provides deterministic feedback, not AI-generated tutoring or proof narration.
- **Choose a new problem** loads the built-in algebra, inequality, calculus, and complex examples, including a negative-coefficient inequality sign-flip demo with a live number line.
- **Start your own** currently creates an algebra-only problem with an equation in `x`; it does not parse arbitrary natural-language prompts.
- Chemistry, Physics, and Biology experiences are interactive visualizers and calculators; they are not connected to the Math verifier or teaching-provider API.
- Foundation practice instances, curriculum progress, and LeetMath submission records are private to the signed-in account. Rough-board storage and LeetMath answer drafts are still local to the browser; clearing browser storage removes them.
- API credentials are backend-only, and CORS is limited to `FRONTEND_ORIGIN`.
- The verifier favors an explicit unsupported result over silently broadening the accepted mathematics.
