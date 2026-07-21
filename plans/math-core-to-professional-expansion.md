# ProofLab: Core-to-Professional Math Expansion

> Implement this after `plans/auth-xp-mastery-foundation.md`. It expands Math from the current algebra, inequalities, introductory calculus, and complex-number foundation into a concept-first curriculum for Explorer, Learner, and Professional tracks. It does not replace the FastAPI + SymPy engine or the account/progress contract.

## 1. Product boundary

ProofLab will cover practical mathematics from first number sense through university core and professional modeling. It will not claim coverage of specialist research mathematics such as topology, abstract algebra, measure theory, or PDE theory.

Use three connected experiences instead of treating every topic as a step-by-step symbolic proof:

| Experience | Best for | Feedback policy |
| --- | --- | --- |
| **Guided ProofLab** | Algebraic transformations, calculus rules, systems, symbolic identities, matrices, and other work with a strong deterministic transition contract | Verify adjacent steps, expose bounded evidence, allow grounded AI help. |
| **Visual Math Lab** | Number sense, geometry, graphs, probability, statistics, transformations, numerical methods, and modeling | Interactive visual relationship checks and final deterministic tasks; no fake formal proof claims. |
| **LeetMath** | Compact independent challenge practice across every strand | Final submission only; no AI hints, repairs, canonical answers, or per-step verdicts. |

Tracks change vocabulary, scaffolding, examples, and default interaction—not mathematical truth:

- **Explorer:** concrete visual-first tasks, guided choice inputs before optional MathLive notation, short feedback.
- **Learner:** standard notation, curated missions, guided proof paths, and concept practice.
- **Professional:** concise problem briefs, units/assumptions, modeling cases, reproducible results, and neutral competency view.

## 2. Curriculum registry and content model

Replace the small frontend-only problem list with a typed backend curriculum registry. Keep it in versioned Python data modules, not a CMS or AI-generated content pipeline.

Each `CurriculumNode` must contain:

```text
id, strand, title, summary, prerequisites, recommendedTracks
objectives, interactionKinds, visualizerType, conceptIds
missionIds, templateIds, leetMathChallengeIds, masteryThreshold
```

Each authored mission supplies the opening context, worked example, misconception copy, allowed verifier adapter, and visualizer configuration. Each template supplies bounded parameters, deterministic seed generation, canonical private answer generation, valid notation constraints, and known misconception variants.

Templates are server-generated and reproducible. The browser receives only the public prompt, learner-safe constraints, instance ID, and rendering data; it never receives a seed, comparator, canonical answer, or private solution path.

### Curriculum strands

| Strand | Required coverage |
| --- | --- |
| **Number & quantitative foundations** | Counting, place value, integers, operations, order of operations, factors/multiples, fractions, decimals, percentages, ratios, rates, proportions, unit conversion, measurement, estimation, and financial arithmetic. |
| **Pre-algebra & functions** | Expressions, variables, coordinate plane, function notation, tables, graph interpretation, transformations, sequences, and patterns. |
| **Algebra** | Linear equations/inequalities, systems, polynomials, factoring, quadratics, rational expressions, radicals, exponents, logarithms, complex numbers, and equation solution sets. |
| **Geometry & trigonometry** | Angles, congruence, similarity, transformations, coordinate geometry, circles, area, surface area, volume, vectors, unit circle, trigonometric functions, identities, and trig equations. |
| **Calculus** | Limits, continuity, derivative rules, implicit differentiation, optimization, related rates, definite/indefinite integration, substitution, accumulation, sequences/series, introductory differential equations, and multivariable/vector-calculus intuition. |
| **Discrete math & probability** | Logic, sets, proof patterns, combinatorics, recurrence basics, probability, conditional probability, Bayes, and distributions. |
| **Statistics & data** | Descriptive statistics, sampling, confidence intervals, hypothesis-testing intuition, correlation, regression, and uncertainty. |
| **Linear algebra & numerical methods** | Matrices, linear systems, determinants, transformations, eigenvalues/eigenvectors, numerical roots, interpolation, approximation, and iterative methods. |
| **Applied modeling & optimization** | Growth/decay, finance, engineering units, constrained optimization, operations-style models, data fitting, sensitivity analysis, and decision trade-offs. |

Make prerequisites visible as recommendations, not hard gates. Adults and professionals can enter any strand; the dashboard should recommend a catch-up node when the selected work depends on unmastered concepts.

## 3. Verifier and API architecture

Keep the restricted parser and SymPy as the only mathematical authority. Do not evaluate raw Python, JavaScript, or arbitrary SymPy expressions from learner input.

Replace the fixed small `ProblemMode` switch with bounded domain adapters. Every adapter implements:

```text
parsePublicInput()
validateTransition()       # optional when a proof path is appropriate
validateFinalAnswer()
canonicalResult()          # private, only for eligible reveal workflows
buildEvidence()
buildVisualization()
publishedLimitations()
```

Use separate published grammars per adapter. Unsupported notation returns `unsupported`; it must never silently broaden the accepted grammar or guess intent.

Implement adapters in this order:

1. `arithmetic-quantity`: rational arithmetic, percentages, ratios, units, tolerance-aware decimal answers.
2. `algebra-functions`: current algebra plus systems, higher polynomials, rational expressions, radicals, exponents, logs, and function transformations.
3. `geometry-trigonometry`: deterministic formula, coordinate, construction-constraint, unit-circle, and trig-equivalence checks.
4. `calculus`: full bounded derivative/integral grammar, limits, optimization, accumulation, introductory differential equations, and multivariable/vector primitives.
5. `complex`: extend rectangular arithmetic to polar form, De Moivre, and bounded polynomial root sets.
6. `discrete-probability-statistics`: exact counting/probability contracts plus tolerance/range contracts for sampled statistics and regression.
7. `linear-algebra-numerical-optimization`: matrices, vectors, systems, eigen results, iteration convergence, constrained objectives, and numerical tolerance contracts.

Retain the existing `VerificationResult` status values (`valid`, `invalid`, `unsupported`, `inconclusive`) and evolve evidence as Pydantic discriminated unions. Add domain-specific evidence types rather than one unstructured result object.

Add authenticated curriculum/practice endpoints:

| Endpoint | Purpose |
| --- | --- |
| `GET /curriculum` | Returns learner-safe nodes, track-relevant recommendations, and progress summary. |
| `GET /curriculum/{nodeId}` | Returns public mission/template metadata and allowed experiences. |
| `POST /practice/next` | Creates an account-owned template instance and returns only public instance data. |
| `POST /practice/{instanceId}/verify` | Validates an allowed guided transition. |
| `POST /practice/{instanceId}/submit` | Validates a final answer, records progress, XP, and mastery events. |
| `GET /practice/{instanceId}` | Restores an account-owned active instance without leaking private contracts. |

Migrate current built-in ProofLab problems to authored missions/templates and map existing LeetMath challenges to curriculum nodes. Preserve existing endpoint behavior during migration with a compatibility layer, then remove duplicate frontend definitions only after all routes use the registry.

## 4. Visual Math Lab

Refactor `MathSimulationPanel` into a visualizer registry. The backend normalizes mathematical state; React only renders it and manages interaction controls.

Required visualizers:

| Visualizer | Used by |
| --- | --- |
| Number line, fraction bars, ratio tables, place-value blocks | Foundations and inequalities |
| Coordinate plane, function graph, line/system intersection, transformation sliders | Functions and algebra |
| Geometry canvas, triangle/circle solver, vector plane, unit circle | Geometry and trigonometry |
| Limit/tangent animation, accumulation area, slope field, complex polar plane | Calculus and complex |
| Truth table, set diagram, probability tree, histogram/distribution, scatter/regression | Discrete math, probability, statistics |
| Matrix transformation plane, optimization contour plot, iterative-method chart | Linear algebra, numerical methods, optimization |

Every visualizer must provide keyboard-operable controls, labels/ARIA descriptions, a non-motion fallback, and a learner-safe empty state. Before a final submission, it may show the learner’s state but never an answer-derived target. Invalid Guided mode evidence may compare states only when the adapter explicitly permits it. LeetMath must never reveal canonical targets after a failed answer.

## 5. Guided AI policy

Continue using the existing teaching-provider interface only after deterministic verification has completed.

- AI may rephrase verified evidence for the active track, give graduated hints, ask a next-step question, or draft a repair.
- Repairs are always untrusted drafts and must pass the same adapter before being offered for application.
- AI cannot judge correctness, generate final-answer contracts, author production templates, reveal LeetMath solutions, or override `unsupported`.
- Prompt payloads contain the current task, learner step, verifier result, track, and explicit response limits. Do not persist model conversation history.

## 6. Build sequence

1. **Registry and migration:** add curriculum/content types, map current 16 ProofLab problems and 30 LeetMath challenges, return catalog data from FastAPI, and remove duplicated client source only after parity tests pass.
2. **Foundations and visual shell:** build arithmetic/quantity adapter plus number-line, fraction, ratio, and coordinate visualizers; create Explorer-friendly missions and template generators.
3. **Algebra through trigonometry:** expand safe parser/verifier coverage, systems/functions/geometry/trig adapters, coordinate/geometry/unit-circle visuals, and Guided/LeetMath mission sets.
4. **Calculus and complex completion:** broaden derivative/integral/limit/ODE/complex contracts with explicit grammar caps; add tangent, area, slope-field, and polar visuals.
5. **Discrete, data, and linear systems:** add probability/statistics, matrices, numerical methods, and optimization adapters with professional case studies and visualizers.
6. **Polish and progression:** connect every activity to concepts/mastery, improve track-specific copy, expand LeetMath filters by strand/difficulty, and complete accessibility/performance review.

## 7. Content and quality gates

- Every template has a fixed seed test matrix: valid generated answer, equivalent alternate form, common misconception, malformed notation, out-of-domain expression, and non-leaking response assertion.
- Every guided adapter has transition tests for legal transformations, illegal transformations, skipped-order errors where applicable, counterexample/evidence correctness, and explicit unsupported boundaries.
- Every numerical/statistical task defines its accepted tolerance, rounding rule, units policy, and random seed before implementation; no client-side floating-point comparison decides correctness.
- Every visualizer has unit tests for normalized server payloads and Playwright tests for keyboard controls, labels, rendering, accepted state, and safe incorrect state.
- End-to-end flows cover all tracks: Explorer completes a visual foundation mission, Learner repairs a verified symbolic step, Professional completes a modeling task, and LeetMath records a final-only accepted/incorrect verdict without AI leakage.
- Run backend tests, frontend unit tests, lint, production build, and Playwright before declaring a strand complete. A strand is not complete until it has authored missions, generated practice, LeetMath challenges, mastery mappings, accessible visualizer behavior, and published limitations.

## Assumptions

- The authentication, profile, XP, and mastery foundation is already implemented and all activity APIs are account-owned.
- The current FastAPI + SymPy service remains available locally; Next.js stays the frontend and does not own symbolic correctness.
- The product will prefer smaller, fully supported grammars over unbounded natural-language math. Research-specialist topics remain deliberately out of scope.
