'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const MATH_GUIDE_SECTIONS = [
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

const CHEMISTRY_GUIDE_SECTIONS = [
  {
    id: 'chemistry-overview',
    navigationLabel: 'Overview',
    eyebrow: 'START HERE',
    title: 'What Chemistry Lab does',
    description: 'Chemistry Lab brings calculation, reaction, and molecular-structure tools together so you can connect a formula, an equation, and a visual model.',
    items: [
      'Start from the Chemistry dashboard to choose a focused tool; each tool keeps its inputs, controls, and results together on one page.',
      'The lab is designed for exploration and calculation. Check units, formulas, and input assumptions before relying on a result.',
    ],
  },
  {
    id: 'chemistry-reactions',
    navigationLabel: 'Balance reactions',
    eyebrow: 'REACTIONS AND COMPOSITION',
    title: 'Balance equations and inspect composition',
    description: 'Use the Equation Balancer and Molar Mass Calculator when a chemical formula or reaction is the starting point.',
    items: [
      'Enter a chemical equation in the Equation Balancer, then review the balanced coefficients and the available reaction-type classification.',
      'Use the Molar Mass Calculator to break a formula into elements, counts, and mass contributions before using that value in later work.',
      'Treat formulas as case-sensitive chemical notation: element symbols, parentheses, and subscripts change the substance being described.',
    ],
    visual: 'chemistry-flow',
  },
  {
    id: 'chemistry-quantities',
    navigationLabel: 'Quantities',
    eyebrow: 'CONNECT AMOUNTS',
    title: 'Work through common quantitative relationships',
    description: 'The advanced calculators focus on the values and relationships used in introductory quantitative chemistry.',
    items: [
      'Use Stoichiometry to compare reactants and products, identify limiting quantities, and reason about theoretical yield.',
      'Use Solution Chemistry for molarity, dilution, pH, and concentration calculations; keep the selected units consistent with the quantity you enter.',
      'Use Thermochemistry, Equilibrium, and Electrochemistry to compare energy, reaction direction, equilibrium constants, cell potentials, and related values.',
    ],
  },
  {
    id: 'chemistry-structures',
    navigationLabel: 'View structures',
    eyebrow: 'SEE THE MOLECULE',
    title: 'Inspect molecules in three dimensions',
    description: 'The Molecule Viewer and Molecular Geometry tools turn structural notation into an interactive spatial view.',
    items: [
      'In the 3D Molecule Viewer, choose a PDB structure and a display style, then drag to rotate, scroll to zoom, and use the context menu for viewer actions.',
      'Use Molecular Geometry to compare VSEPR shapes, electron-domain arrangements, hybridization, and polarity predictions.',
      'A visual model is a learning aid: use it alongside the formula and the tool’s explanation instead of treating it as a complete experimental representation.',
    ],
  },
  {
    id: 'chemistry-read-results',
    navigationLabel: 'Read results',
    eyebrow: 'CHECK THE OUTPUT',
    title: 'Read a result in context',
    description: 'Each Chemistry tool presents a calculation or classification with the values that produced it so you can validate the setup before moving on.',
    items: [
      'Review warnings and validation messages before changing a formula or number; they often identify an incomplete equation, unavailable value, or unsupported input.',
      'Change one input at a time when comparing scenarios, then note how the displayed result and explanation respond.',
      'Use the Back link on a nested tool page to return to the Chemistry dashboard and choose a related exploration.',
    ],
  },
  {
    id: 'chemistry-boundaries',
    navigationLabel: 'Limits and session',
    eyebrow: 'KNOW THE BOUNDARIES',
    title: 'Know what Chemistry Lab is for',
    description: 'Chemistry Lab is an interactive learning environment, not a laboratory notebook or a substitute for experimental measurements.',
    items: [
      'Calculator results depend on the formula, values, and units you provide; use classroom conventions and source data appropriate to your task.',
      'Structure data and visualizations are for exploration and may not show every experimental condition, conformation, or molecular interaction.',
      'The tools do not require an account or create a shared lab record.',
    ],
  },
];

const PHYSICS_GUIDE_SECTIONS = [
  {
    id: 'physics-overview',
    navigationLabel: 'Overview',
    eyebrow: 'START HERE',
    title: 'What Physics Lab does',
    description: 'Physics Lab pairs equations with visual, adjustable simulations so you can observe how a change in one quantity affects the rest of a system.',
    items: [
      'Begin on the Physics dashboard to choose a formula or simulator that matches the phenomenon you want to explore.',
      'Use the controls to form a prediction, change one variable, then compare the chart, diagram, and numerical result.',
    ],
  },
  {
    id: 'physics-formulas',
    navigationLabel: 'Use formulas',
    eyebrow: 'RELATIONSHIPS FIRST',
    title: 'Start with the Formula Visualizer',
    description: 'The Formula Visualizer helps you compare common relationships before opening a full simulation.',
    items: [
      'Choose an equation from the dashboard tabs to see its variables and change their values with the provided controls.',
      'Use the displayed result to check your prediction about direction and scale rather than memorizing an isolated formula.',
      'Keep track of the unit shown beside each control; a correct relationship can still be used incorrectly with mismatched units.',
    ],
    visual: 'physics-flow',
  },
  {
    id: 'physics-motion',
    navigationLabel: 'Model motion',
    eyebrow: 'KINEMATICS AND TRAJECTORIES',
    title: 'Explore motion over time',
    description: 'Kinematics and Projectile Motion focus on how position, velocity, acceleration, angle, and time shape a moving object’s path.',
    items: [
      'Use Kinematics to adjust initial velocity, acceleration, and time, then compare the position, velocity, and acceleration graphs.',
      'Use Projectile Motion to connect launch conditions to a two-dimensional trajectory and observe the horizontal and vertical components together.',
      'Pause on a single scenario before changing another variable so you can distinguish cause from coincidence.',
    ],
  },
  {
    id: 'physics-systems',
    navigationLabel: 'Compare systems',
    eyebrow: 'ENERGY, VECTORS, AND CIRCUITS',
    title: 'Compare quantities across a system',
    description: 'The remaining simulations make abstract quantities visible as bars, arrows, oscillations, and circuit components.',
    items: [
      'Use Energy Explorer to compare kinetic, potential, and total energy as the setup changes.',
      'Use Vector Visualizer to build head-to-tail additions on a coordinate plane and inspect the resulting magnitude and direction.',
      'Use the SHM Visualizer and Circuit Simulator to explore oscillation and electrical relationships with live controls and diagrams.',
    ],
  },
  {
    id: 'physics-read-results',
    navigationLabel: 'Read results',
    eyebrow: 'INTERPRET THE MODEL',
    title: 'Use charts and diagrams as evidence',
    description: 'Every visualization is most useful when you connect its change back to the variable and relationship that produced it.',
    items: [
      'Read axes, labels, and legends before comparing values; different visualizers emphasize different quantities.',
      'Use one variable change at a time when testing a relationship, then reset or return to a familiar baseline before a new comparison.',
      'Use the Back link to return to the Physics dashboard when you want to move from one model to a related simulator.',
    ],
  },
  {
    id: 'physics-boundaries',
    navigationLabel: 'Limits and session',
    eyebrow: 'KNOW THE BOUNDARIES',
    title: 'Know what Physics Lab models',
    description: 'Physics Lab uses focused learning models that highlight selected relationships rather than every condition present in a physical experiment.',
    items: [
      'Treat the controls, diagrams, and graphs as a way to reason about the stated model and its assumptions.',
      'Use experimental data, uncertainty analysis, and additional theory when a real-world task requires them.',
      'The simulations run in the browser and do not require an account or shared session.',
    ],
  },
];

const BIOLOGY_GUIDE_SECTIONS = [
  {
    id: 'biology-overview',
    navigationLabel: 'Overview',
    eyebrow: 'START HERE',
    title: 'What Biology Lab does',
    description: 'Biology Lab provides interactive views of structures, inheritance, evolutionary relationships, and ecosystem cycles.',
    items: [
      'Start from the Biology dashboard to choose the level of organization you want to explore, from body regions to populations and cycles.',
      'Use the controls and labels in each explorer to connect a visual feature with its biological role or relationship.',
    ],
  },
  {
    id: 'biology-anatomy',
    navigationLabel: 'Explore anatomy',
    eyebrow: 'STRUCTURE AND LOCATION',
    title: 'Use body views to connect structures and systems',
    description: 'The Anatomy Viewer and Body Picker help you locate body regions, organs, and their associated systems.',
    items: [
      'Select a body region or organ in the Anatomy Viewer to read its description and see the system context.',
      'Use the Body Picker controls to compare supported body views and select regions interactively.',
      'Treat the illustrated body as a guided reference: use labels and descriptions to build vocabulary before moving into an organ-system view.',
    ],
    visual: 'biology-flow',
  },
  {
    id: 'biology-systems',
    navigationLabel: 'Organ systems',
    eyebrow: 'SYSTEMS WORK TOGETHER',
    title: 'Explore the major human body systems',
    description: 'Organ Systems provides focused diagrams and information panels for the skeletal, muscular, nervous, endocrine, circulatory, lymphatic, respiratory, digestive, and urinary systems.',
    items: [
      'Choose a system from the navigation control to update the diagram and the accompanying information panel.',
      'Open a dedicated system page when available for a more focused view, then use the nested Back link to return to the Organ Systems overview.',
      'Compare systems by their organs, functions, and common conditions rather than treating them as isolated lists.',
    ],
  },
  {
    id: 'biology-genetics',
    navigationLabel: 'Genetics',
    eyebrow: 'INHERITANCE AND VARIATION',
    title: 'Follow traits from chromosomes to offspring',
    description: 'The genetics tools connect chromosome annotations with a Mendelian inheritance simulation.',
    items: [
      'Use the Chromosome Viewer to inspect gene annotations and their positions in an interactive chromosome view.',
      'Use Gene Inheritance to compare parent traits and observe the resulting offspring patterns in the pea-plant simulator.',
      'Change one parent trait or condition at a time so the resulting pattern is easier to interpret.',
    ],
  },
  {
    id: 'biology-relationships',
    navigationLabel: 'Evolution and ecology',
    eyebrow: 'LIFE IN CONTEXT',
    title: 'Trace relationships across time and ecosystems',
    description: 'Evolution and Ecology tools show how organisms are related and how matter moves through biological cycles.',
    items: [
      'Use the Phylogenetic Tree to explore evolutionary relationships represented in a Newick-style tree.',
      'Use Ecology Cycles to explore biogeochemical cycles and follow the reservoirs and flows that connect them.',
      'Zoom, pan, or select details as needed, then return to the dashboard to connect the topic to another level of biology.',
    ],
  },
  {
    id: 'biology-boundaries',
    navigationLabel: 'Limits and session',
    eyebrow: 'KNOW THE BOUNDARIES',
    title: 'Know what Biology Lab represents',
    description: 'Biology Lab is an interactive guide to selected structures and relationships, not a clinical, diagnostic, or research tool.',
    items: [
      'Use the visualizations to support learning and vocabulary-building, then consult course materials or authoritative references for deeper study.',
      'Illustrations and simulations simplify living systems so one structure, trait, or relationship can be explored at a time.',
      'The tools run without an account and do not record a personal health, genetics, or research profile.',
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

const GUIDE_TABS = [
  {
    id: 'math',
    label: 'Math Lab',
    icon: '🔢',
    title: 'Use the ProofLab visualizer with confidence.',
    description: 'Learn what every panel, control, status, and mode-specific action does before you continue your reasoning path.',
    sections: MATH_GUIDE_SECTIONS,
  },
  {
    id: 'chemistry',
    label: 'Chemistry Lab',
    icon: '🧪',
    title: 'Use Chemistry Lab with confidence.',
    description: 'Learn how each calculator and visualizer connects formulas, reactions, quantities, and molecular structures.',
    sections: CHEMISTRY_GUIDE_SECTIONS,
  },
  {
    id: 'physics',
    label: 'Physics Lab',
    icon: '🔬',
    title: 'Use Physics Lab with confidence.',
    description: 'Learn how to use equations, controls, charts, and diagrams to investigate focused physical models.',
    sections: PHYSICS_GUIDE_SECTIONS,
  },
  {
    id: 'biology',
    label: 'Biology Lab',
    icon: '🧬',
    title: 'Use Biology Lab with confidence.',
    description: 'Learn how each explorer connects biological structures, systems, inheritance, relationships, and cycles.',
    sections: BIOLOGY_GUIDE_SECTIONS,
  },
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

  const visualContent = {
    'chemistry-flow': [
      ['1', 'Write the chemistry', 'Enter a formula or equation and confirm the chemical notation.'],
      ['2', 'Choose a relationship', 'Use a calculator or classification tool for the quantity you want to compare.'],
      ['3', 'Inspect the structure', 'Use 3D and geometry views to connect the result to molecular form.'],
    ],
    'physics-flow': [
      ['1', 'Choose a model', 'Select an equation or simulator that matches the phenomenon.'],
      ['2', 'Change one value', 'Adjust a variable and make a prediction before reading the output.'],
      ['3', 'Compare the evidence', 'Use the chart, diagram, and result together to explain the change.'],
    ],
    'biology-flow': [
      ['1', 'Locate a feature', 'Select a body region, organ, trait, or relationship to explore.'],
      ['2', 'Read the context', 'Use labels and information panels to connect structure with function.'],
      ['3', 'Follow the system', 'Move to systems, inheritance, trees, or cycles to see broader relationships.'],
    ],
  }[kind];

  if (!visualContent) return null;

  return (
    <div className="guide-learning-map" role="img" aria-label="A three-step workflow for using this learning lab.">
      {visualContent.map(([number, title, detail]) => (
        <div key={title}>
          <span>{number}</span>
          <strong>{title}</strong>
          <p>{detail}</p>
        </div>
      ))}
    </div>
  );
}

function getReturnDestination(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/guide')) {
    return { href: '/dashboard', label: 'Back to dashboard' };
  }

  const [lab] = value.split('/').filter(Boolean);
  const labels = {
    biology: 'Back to Biology Lab',
    chemistry: 'Back to Chemistry Lab',
    physics: 'Back to Physics Lab',
  };

  return { href: value, label: labels[lab] ?? 'Back to Math Lab' };
}

function getGuideTab(value) {
  const [lab] = value?.split('/').filter(Boolean) ?? [];
  return GUIDE_TABS.some((tab) => tab.id === lab) ? lab : 'math';
}

export default function GuideScreen({ initialTab = undefined }) {
  const titleRef = useRef(null);
  const searchParams = useSearchParams();
  const sourcePath = searchParams?.get('from');
  const [activeTab, setActiveTab] = useState(() => initialTab ?? getGuideTab(sourcePath));
  const [activeSectionsByTab, setActiveSectionsByTab] = useState({});
  const returnDestination = useMemo(() => getReturnDestination(sourcePath), [sourcePath]);
  const activeGuide = GUIDE_TABS.find((tab) => tab.id === activeTab) ?? GUIDE_TABS[0];
  const activeSectionId = activeSectionsByTab[activeGuide.id] ?? activeGuide.sections[0].id;

  useEffect(() => {
    titleRef.current?.focus();
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);
      const nextSectionId = visibleSections[0]?.target.id;

      if (!nextSectionId) return;
      setActiveSectionsByTab((current) => (
        current[activeGuide.id] === nextSectionId
          ? current
          : { ...current, [activeGuide.id]: nextSectionId }
      ));
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

    activeGuide.sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [activeGuide.id, activeGuide.sections]);

  const selectSection = (sectionId) => {
    setActiveSectionsByTab((current) => ({ ...current, [activeGuide.id]: sectionId }));
  };

  return (
    <section className="guide-screen" aria-labelledby="guide-title">
      <header className="guide-header">
        <div className="guide-wordmark"><span aria-hidden="true">◎</span> ProofLab <span>/</span> Platform Guide</div>
        <div className="guide-header-actions"><Link className="guide-close-button" href={returnDestination.href}>← {returnDestination.label}</Link></div>
      </header>

      <div className="guide-tabs" role="tablist" aria-label="Learning lab guides">
        {GUIDE_TABS.map((tab) => (
          <button
            aria-controls={`guide-panel-${tab.id}`}
            aria-selected={activeGuide.id === tab.id}
            className={`guide-tab ${activeGuide.id === tab.id ? 'is-active' : ''}`}
            id={`guide-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="guide-layout">
        <nav className="guide-navigation" aria-label={`${activeGuide.label} guide sections`}>
          <span className="guide-navigation-label">{activeGuide.label.toUpperCase()}</span>
          <div className="guide-navigation-links">
            {activeGuide.sections.map((section) => (
              <a
                aria-current={activeSectionId === section.id ? 'location' : undefined}
                className={activeSectionId === section.id ? 'is-active' : undefined}
                href={`#${section.id}`}
                key={section.id}
                onClick={() => selectSection(section.id)}
              >
                {section.navigationLabel}
              </a>
            ))}
          </div>
        </nav>

        <main aria-labelledby={`guide-tab-${activeGuide.id}`} className="guide-content" id={`guide-panel-${activeGuide.id}`} role="tabpanel">
          <section className="guide-intro">
            <span className="panel-eyebrow">{activeGuide.label.toUpperCase()} GUIDE</span>
            <h1 id="guide-title" ref={titleRef} tabIndex="-1">{activeGuide.title}</h1>
            <p>{activeGuide.description}</p>
          </section>

          {activeGuide.sections.map((section) => (
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
