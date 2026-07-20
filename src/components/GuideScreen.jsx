'use client';

import { useEffect, useRef } from 'react';

const GUIDE_SECTIONS = [
  {
    id: 'what-prooflab-does',
    navigationLabel: 'Overview',
    eyebrow: 'START HERE',
    title: 'What ProofLab does',
    description: 'ProofLab is a visual reasoning workspace. You build a path one step at a time, and the verifier checks each transition before optional coaching explains the result.',
    items: [
      'Verification decides whether a supported transition is valid; coaching never decides mathematical correctness.',
      'The guide explains how to use the workspace. It does not provide worked answers or solve problems for you.',
    ],
  },
  {
    id: 'choose-and-reset',
    navigationLabel: 'Choose a problem',
    eyebrow: 'SET UP YOUR WORK',
    title: 'Choose, start, or reset a problem',
    description: 'Use the current-problem panel to control the board before you begin a reasoning path.',
    items: [
      'Choose a problem opens the built-in library. Select a card to load that problem and its prepared starting state.',
      'Start your own creates an algebra-only board from an equation in x. Give it a name and goal to make it easy to recognize.',
      'Reset example or Reset my problem returns the current board to its starting state and removes work added in this session.',
    ],
  },
  {
    id: 'read-the-workspace',
    navigationLabel: 'Read the workspace',
    eyebrow: 'THE VISUALIZER',
    title: 'Read the visualizer from left to right',
    description: 'The board separates the problem, your reasoning path, and the evidence for a selected transition.',
    items: [
      'The Problem panel holds the prompt, goal, progress, and problem-management controls.',
      'The Reasoning path stacks your given statement and later steps. The line between cards represents one transition.',
      'Select a transition line to open the Evidence inspector, where ProofLab explains the result of that exact change.',
    ],
    visual: 'workspace',
  },
  {
    id: 'build-and-manage-steps',
    navigationLabel: 'Build steps',
    eyebrow: 'YOUR REASONING PATH',
    title: 'Add, check, edit, and remove steps',
    description: 'Use the action at the end of the reasoning path to add the next relevant kind of work for the selected mode.',
    items: [
      'Enter work in the math field, use the small fraction, exponent, and parentheses shortcuts if useful, then choose Check step.',
      'A checked transition becomes part of the path. Selecting a card’s edit control lets you revise that step; deleting a step removes it and every later step.',
      'When you edit an earlier step, ProofLab rechecks every later transition it can reach and stops at the first result that needs attention.',
    ],
  },
  {
    id: 'understand-feedback',
    navigationLabel: 'Understand feedback',
    eyebrow: 'EVIDENCE FIRST',
    title: 'Understand the colors, labels, and evidence',
    description: 'The visual state tells you whether a transition is verified, needs repair, or needs another check. Select its connecting line for the evidence behind that state.',
    items: [
      'Checked means the verifier confirmed the transition using a supported rule.',
      'Needs repair means the transition changed the result. Evidence may include a concrete reality check, a mistake pattern, or a complex-value comparison.',
      'Needs rechecking is neutral: ProofLab either needs an earlier step resolved first or cannot verify this kind of notation yet.',
      'For inequalities, the inspector can compare solution regions on a number line and point to a value that distinguishes them.',
    ],
    visual: 'feedback',
  },
  {
    id: 'use-coaching',
    navigationLabel: 'Use coaching',
    eyebrow: 'OPTIONAL HELP',
    title: 'Use coaching after you inspect evidence',
    description: 'When a transition needs repair, the inspector offers focused help for the selected transition only.',
    items: [
      'Give me a hint offers a small nudge without taking over your reasoning path.',
      'Explain why expands the evidence into a concise explanation of why the transition changed the result.',
      'Show repair presents a draft. Apply and check always verifies that draft before it replaces your step.',
    ],
  },
  {
    id: 'track-completion',
    navigationLabel: 'Track completion',
    eyebrow: 'PROGRESS',
    title: 'Track progress and canonical completion',
    description: 'Progress dots summarize the earliest transitions in the current path. Some built-in tasks also define a deterministic final target.',
    items: [
      'Complete means every submitted transition is valid and the final step matches that task’s target.',
      'In progress means your path is valid so far but has not reached the target. Needs correction means a transition requires attention.',
      'Reveal final form is available only when a task has a canonical target. It displays the target without editing your work or changing completion.',
    ],
  },
  {
    id: 'mode-controls',
    navigationLabel: 'Mode controls',
    eyebrow: 'TASK-SPECIFIC ACTIONS',
    title: 'Use the action that matches the current mode',
    description: 'The final action on the reasoning path changes with the selected problem, so the workspace asks for the kind of statement the verifier expects.',
    items: [
      'Unsupported notation is a scope result, not a wrong-answer judgement. Return to the published mode scope before changing your work.',
    ],
    visual: 'modes',
  },
  {
    id: 'boundaries-and-session',
    navigationLabel: 'Limits and session',
    eyebrow: 'KNOW THE BOUNDARIES',
    title: 'Know what ProofLab can check',
    description: 'ProofLab deliberately supports a focused set of problem types and notation so that its feedback stays specific and trustworthy.',
    items: [
      'The platform checks published algebra, inequality, calculus, and complex-number scopes. It is not a general natural-language question-answering tool.',
      'An unsupported result means the current expression or transition is outside that scope; it does not label your reasoning incorrect.',
      'Your board is held in the current browser session. ProofLab has no account system, cloud sync, or durable saved-work history.',
    ],
  },
];

const MODE_CONTROLS = [
  ['Algebra', 'Add next step', 'Build an equivalent algebra step. Custom problems use this algebra-only workflow.'],
  ['Inequalities', 'Add inequality step', 'Submit the next inequality transition and inspect region evidence when needed.'],
  ['Derivatives', 'Add next derivative', 'Advance the derivative notation one order at a time.'],
  ['Indefinite integrals', 'Add antiderivative', 'Enter the antiderivative form required by the integral workflow.'],
  ['Complex simplification', 'Add next step', 'Build an equivalent rectangular-form simplification step.'],
  ['Complex solving', 'Add equivalent step / Submit solution set', 'Use the first action for an intermediate equivalent statement and the second when you are ready to submit the complete solution set.'],
];

function GuideVisual({ kind }) {
  if (kind === 'workspace') {
    return (
      <div className="guide-workspace-map" role="img" aria-label="The ProofLab workspace has a Problem panel, a central Reasoning path, and an Evidence inspector.">
        <div className="guide-map-panel guide-map-problem"><span>1</span><strong>Problem panel</strong><p>Prompt, goal, progress, and problem controls.</p></div>
        <div className="guide-map-panel guide-map-path"><span>2</span><strong>Reasoning path</strong><p>Cards and transition lines show the work in order.</p></div>
        <div className="guide-map-panel guide-map-evidence"><span>3</span><strong>Evidence inspector</strong><p>Select a line to understand one transition.</p></div>
      </div>
    );
  }

  if (kind === 'feedback') {
    return (
      <div className="guide-status-legend" aria-label="Feedback status legend">
        <div><span className="guide-status-chip checked">Checked</span><p>Verified transition.</p></div>
        <div><span className="guide-status-chip repair">Needs repair</span><p>Evidence shows the transition changed the result.</p></div>
        <div><span className="guide-status-chip rechecking">Needs rechecking</span><p>Resolve an earlier result or use supported notation.</p></div>
      </div>
    );
  }

  if (kind === 'modes') {
    return (
      <div className="guide-mode-grid">
        {MODE_CONTROLS.map(([mode, action, detail]) => (
          <article className="guide-mode-card" key={mode}>
            <span>{mode}</span>
            <strong>{action}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </div>
    );
  }

  return null;
}

export default function GuideScreen({ onClose }) {
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <section className="guide-screen" aria-labelledby="guide-title">
      <header className="guide-header">
        <div className="guide-wordmark"><span aria-hidden="true">◎</span> ProofLab <span>/</span> Guide</div>
        <div className="guide-header-actions"><button className="guide-close-button" onClick={onClose}>← Back to proof</button></div>
      </header>

      <div className="guide-layout">
        <nav className="guide-navigation" aria-label="Guide sections">
          <span className="guide-navigation-label">ON THIS PAGE</span>
          <div className="guide-navigation-links">
            {GUIDE_SECTIONS.map((section) => <a key={section.id} href={`#${section.id}`}>{section.navigationLabel}</a>)}
          </div>
        </nav>

        <main className="guide-content">
          <section className="guide-intro">
            <span className="panel-eyebrow">PLATFORM GUIDE</span>
            <h1 id="guide-title" ref={titleRef} tabIndex="-1">Use the ProofLab visualizer with confidence.</h1>
            <p>Learn what every panel, control, status, and mode-specific action does before you continue your reasoning path.</p>
          </section>

          {GUIDE_SECTIONS.map((section) => (
            <section className="guide-section" id={section.id} key={section.id}>
              <span className="panel-eyebrow">{section.eyebrow}</span>
              <h2>{section.title}</h2>
              <p className="guide-section-description">{section.description}</p>
              <ul>
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <GuideVisual kind={section.visual} />
            </section>
          ))}
        </main>
      </div>
    </section>
  );
}
