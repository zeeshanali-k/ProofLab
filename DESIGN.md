# ProofLab design brief

## Product and design intent

Design **ProofLab**, a visual algebra-reasoning debugger for students aged approximately 13–18. It helps a learner see where a sequence of algebra steps first stops being true. The product should feel like a focused creative learning tool: part laboratory notebook, part visual debugger, never a generic chatbot or conventional document editor.

The central interaction is a chain of mathematical step cards connected by status-bearing edges. A green edge means the mathematical transformation is verified. A red edge means ProofLab has found evidence that the transformation is invalid. Selecting an edge opens an evidence inspector—not a chat window.

## Design goals

- Make mathematical state and correctness immediately scannable.
- Give mistakes a calm, useful treatment; red communicates a broken relationship, not personal failure.
- Make the counterexample feel concrete and almost experimental: “test this value and observe what happens.”
- Let students own the work. Suggestions are drafts, never silent replacements.
- Prioritize one polished desktop demo while retaining a graceful narrow-screen layout.

## What not to design

- No persistent conversational sidebar, message bubbles, assistant avatar, or “Ask anything” prompt.
- No word-processor toolbar, page canvas, notebook tabs, or file-manager chrome.
- No handwriting canvas, image upload, collaboration cursors, gamified points, leaderboards, or dashboard analytics.
- Do not overwhelm the student with technical terms such as symbolic engine, residual, parser, or model confidence.

## Visual direction

Create a modern “math lab at night” interface: calm ink-blue workspace, warm paper-colored cards, electric mint for validated reasoning, and coral-red only for invalid transitions. The overall result should be highly polished, tactile, and legible—not childish, sci-fi, or corporate.

### Color system

| Token | Use | Suggested color |
|---|---|---|
| `canvas` | Main workspace | `#F6F8FC` cool off-white |
| `ink` | Primary text/formulas | `#172033` deep navy |
| `muted` | Supporting labels | `#6A7485` slate |
| `card` | Reasoning cards | `#FFFFFF` |
| `border` | Subtle structure | `#DCE3EE` |
| `valid` | Verified edge/status | `#1DAA7A` mint green |
| `invalid` | Broken edge/status | `#E85D5D` coral red |
| `warning` | Unsupported/recheck | `#E8A83A` amber |
| `accent` | Primary actions/focus | `#5B5CE2` indigo |
| `evidence-bg` | Counterexample panel | `#FFF1F0` soft coral tint |

Use color with icons and labels; never rely on color alone.

### Typography

- UI: Inter, Geist, or similarly clean rounded sans serif.
- Formulas: KaTeX/Computer Modern styling; equations should be notably larger than surrounding labels.
- Headings: 600–700 weight, compact line-height.
- Body copy: 14–16px, reassuring and direct.
- Numeric evidence: tabular figures where possible.

## Primary screen: Proof Board

Desktop layout uses three zones, with generous whitespace and an uninterrupted central reasoning path.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ProofLab    Algebra Lab / Quadratics                   Save status   •••    │
├───────────────┬──────────────────────────────────────┬─────────────────────┤
│ PROBLEM       │ REASONING PATH                       │ TRANSITION INSPECTOR│
│               │                                      │                     │
│ Solve         │  [ Given ]                           │ Invalid expansion   │
│ (x + 2)²=25  │  (x + 2)² = 25                        │                     │
│               │       │                              │ x = 3 is a reality │
│ Goal          │       │  verified expansion          │ check:              │
│ Find x        │       ▼                              │ original: 25        │
│               │  [ Step 2 ]                          │ entered: 13         │
│               │  x² + 4 = 25                         │                     │
│               │       │                              │ [Hint] [Explain]    │
│               │       │  invalid: missing term       │ [Show repair]       │
│               │       ▼                              │                     │
│               │  [ Add next step ]                   │                     │
└───────────────┴──────────────────────────────────────┴─────────────────────┘
```

### Header

- Left: ProofLab wordmark; an understated geometric mark resembling linked equation nodes.
- Center/left: breadcrumb `Algebra Lab / Quadratics`.
- Right: discreet local-save indicator, help icon, overflow menu.
- Keep header 64px high with a thin bottom border. No navigation clutter.

### Problem rail

Width approximately 240px. It remains quiet and stable while the student works.

- Eyebrow: `TODAY'S PROBLEM`.
- Prompt card: `Solve: (x + 2)² = 25` rendered at 24–28px.
- Goal label: `Find all values of x`.
- A small progress indicator: `2 of 4 steps checked`.
- Bottom action: `Reset example`, secondary/low emphasis.

### Reasoning path

The central area is the visual focus. It should feel like a deliberate vertical flow rather than an untidy freeform whiteboard.

- Cards align on one center axis and connect vertically.
- The graph may use React Flow internally, but the default demo should be intentionally composed, not randomly positioned.
- Allow cards to be dragged subtly; connections stay clear.
- Provide roomy vertical gaps so edges can carry labels and show state changes.
- Empty state uses one approachable card reading `Add your first step` with a plus icon.

### Step cards

Each card is 380–460px wide, white, with 16px radius, soft 1px border, and restrained shadow. It contains:

- Top row: `GIVEN`, `STEP 2`, or `YOUR ANSWER` label; status pill on the right.
- Center: displayed equation in large KaTeX styling.
- Bottom row: small timestamp/order label and icon-only edit/delete controls on hover or focus.

Root card: thin indigo top accent and `Given` pill.

Valid card: small mint verification icon and label `Checked`.

Invalid card: coral left accent and `Needs repair` pill. Do not shake the card or use alarming motion.

Recheck card: soft amber styling and `Rechecking…` or `Needs rechecking` label.

### Edges

Edges are a core product element, not decoration.

- Valid: 3px mint line with a small circular check marker. Label examples: `expanded square`, `subtracted 25 from both sides`.
- Invalid: 3px coral line with a small break marker. Label: `not equivalent` or `missing term`.
- Pending: dashed slate/amber line.
- Selected edge: gets a 6–8px pale indigo halo, not a stronger red/green.
- Clicking an edge opens the inspector and scrolls it into view if needed.

### Add-step interaction

At the end of the chain, show a prominent but friendly `+ Add next step` card. Clicking it opens an inline equation composer below the previous step.

- MathLive field is the visual hero: large, centered, and uncluttered.
- Show a compact input toolbar only for essential actions: undo, redo, fraction, exponent, parentheses, and submit.
- Primary button: `Check step`.
- Secondary text button: `Cancel`.
- While checking, convert the button to `Checking…` with a small spinner; do not block editing unrelated cards.

## Transition inspector

This right-hand panel changes based on the selected edge. Width approximately 320–360px. It is an evidence lab, not an AI conversation.

### Invalid-state inspector

1. Header with coral broken-link icon, `This transition changes the equation`, and close button.
2. A short, plain-language finding: `The expanded expression is missing a term.`
3. Counterexample card with the heading `Reality check: try x = 3`.
4. Two compact calculation rows:

```text
Original     (3 + 2)²     = 25
Your step    3² + 4       = 13
```

5. Small note: `Because the results differ, these expressions are not equivalent.`
6. Three actions:
   - `Give me a hint` — outlined secondary button.
   - `Explain why` — secondary button.
   - `Show repair` — indigo primary button, disabled only while loading.

### Hint state

Show a single question in a pale indigo callout, not a conversation bubble:

> When expanding `(x + 2)²`, what are the two cross-products involving `x` and `2`?

Include `I’ll try again` as the primary next action. Do not reveal `4x` in hint mode.

### Explanation state

Present an expandable “why” walkthrough using clean rows:

```text
(x + 2)² = (x + 2)(x + 2)
          = x² + 2x + 2x + 4
          = x² + 4x + 4
```

Add a `Back to evidence` action. Keep it under 120 words.

### Repair state

Present the candidate as a diff rather than silently changing the student’s work:

```text
Your step       x² + 4 = 25
Suggested       x² + 4x + 4 = 25
                         +4x
```

Actions: `Apply and check` (primary) and `Keep mine` (secondary). Applying must visibly re-run verification before the card turns green.

### Valid-state inspector

Use a mint check icon, `This step preserves the equation`, the detected rule label, and a brief affirmative message such as `Nice—both sides were reduced by 25.` Do not show AI actions by default.

### Unsupported/inconclusive inspector

Use amber, neutral language:

> ProofLab cannot verify this kind of step yet.

Offer the scope: `This version checks one-variable linear and quadratic algebra.` Never frame it as a learner error.

## Key interaction and motion principles

- Validation: when a new result arrives, animate only the edge from grey to green/red over 180–220ms. Then fade in the label and inspector evidence.
- Repair: new term diff highlights briefly; the outgoing edge changes from coral to neutral while checking, then mint when verified.
- Downstream changes: later nodes fade to 60% opacity with `Needs rechecking`; re-enable one at a time as verification completes.
- Keep motion low and optional; honor `prefers-reduced-motion`.
- Never create typing animations for AI text. Evidence should feel immediate and factual.

## Responsive behavior

- Desktop (≥1100px): three-column layout as described.
- Tablet (760–1099px): hide the problem rail behind a `Problem` button; inspector becomes a right-side sheet.
- Mobile (<760px): single vertical flow; cards remain centered; tapping an edge opens a bottom sheet inspector. Equation input must remain usable with the on-screen keyboard.
- Do not attempt a dense graph on mobile. Preserve the linear sequence.

## Accessibility requirements

- Every status uses an icon, visible label, and color.
- All card, edge, edit, and inspector actions are keyboard reachable.
- Give edges accessible names such as `Transition from Step 1 to Step 2: invalid, missing term`.
- Maintain 4.5:1 text contrast and clear focus rings in indigo.
- Announce completed verification via a polite live region: `Step 2 is invalid. Counterexample available.`
- Equations have accessible spoken labels in addition to visual KaTeX output.

## Seeded demo content

Preload an example named `The missing middle term`:

```text
Given:        (x + 2)² = 25
Incorrect:    x² + 4 = 25
Repair:       x² + 4x + 4 = 25
Next step:    x² + 4x - 21 = 0
```

The initial screenshot/design state should show the incorrect Step 2 selected, its red edge, and the `x = 3` reality check in the inspector. This is the clearest product story at a glance.
