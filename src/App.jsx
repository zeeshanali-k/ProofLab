import { useState, useEffect } from 'react';
import { ProofService, ENV_MODE } from './api/ProofService';
import MathDisplay from './components/MathDisplay';
import { CheckIcon, BrokenIcon, PlusIcon } from './components/Icons';
import './index.css';

export default function App() {
  const [data, setData] = useState({ problem: null, steps: [], edges: [] });
  const [selectedEdgeId, setSelectedEdgeId] = useState('e1'); // Pre-select demo edge
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    ProofService.fetchInitialState().then(setData);
  }, []);

  const handleAddStep = async () => {
    setIsChecking(true);
    // Example interaction: Adding a step triggers the verification service
    const result = await ProofService.verifyStep(
      data.steps[data.steps.length - 1].math, 
      "x^2 + 4x - 21 = 0" // Hardcoded for demo purposes
    );
    // In a full implementation, this result updates the state tree here.
    setIsChecking(false);
  };

  const selectedEdgeData = data.edges.find(e => e.id === selectedEdgeId);

  if (!data.problem) return <div className="workspace" style={{padding: '40px'}}>Loading Lab...</div>;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="wordmark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="logo-icon">
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="12" r="3"></circle>
              <line x1="9" y1="12" x2="15" y2="12"></line>
            </svg>
            ProofLab
          </div>
          <div className="breadcrumb">Algebra Lab / Quadratics</div>
        </div>
        <div className="header-right">
          <span className="save-status">Mode: {ENV_MODE}</span>
          <button className="icon-btn" aria-label="Help">?</button>
          <button className="icon-btn" aria-label="Menu">•••</button>
        </div>
      </header>

      <main className="workspace">
        {/* Problem Rail */}
        <aside className="problem-rail">
          <div className="rail-eyebrow">TODAY'S PROBLEM</div>
          <div className="prompt-card">
            <div className="prompt-label">Solve</div>
            <MathDisplay math={data.problem.prompt} />
          </div>
          <div className="goal-section">
            <div className="goal-label">Goal</div>
            <div className="goal-text">{data.problem.goal}</div>
          </div>
          <div className="progress-indicator">
            <span className="progress-dot checked"></span>
            <span className="progress-dot error"></span>
            <span className="progress-dot"></span>
            <span className="progress-text">{data.problem.progress}</span>
          </div>
          <button className="btn-secondary mt-auto">Reset example</button>
        </aside>

        {/* Reasoning Path */}
        <section className="reasoning-path">
          <div className="path-container">
            {data.steps.map((step, index) => {
              const edgeOut = data.edges.find(e => e.from === step.id);
              return (
                <div key={step.id} style={{width: '100%'}}>
                  {/* Step Card */}
                  <div className={`step-card ${step.type === 'GIVEN' ? 'root-card' : ''} ${step.status === 'invalid' ? 'invalid-card' : ''}`}>
                    <div className="card-header">
                      <span className="step-label">{step.type}</span>
                      <span className={`status-pill ${step.status}`}>
                        {step.status === 'valid' ? <><CheckIcon /> Checked</> : 'Needs repair'}
                      </span>
                    </div>
                    <div className="card-body">
                      <MathDisplay math={step.math} />
                    </div>
                    <div className="card-footer">
                      <span className="timestamp">{step.timestamp}</span>
                    </div>
                  </div>

                  {/* Connected Edge */}
                  {edgeOut && (
                    <div 
                      className={`edge-container ${selectedEdgeId === edgeOut.id ? 'selected' : ''}`}
                      onClick={() => setSelectedEdgeId(edgeOut.id)}
                      role="button"
                      tabIndex="0"
                    >
                      <div className={`edge-line ${edgeOut.status}`}></div>
                      <div className={`edge-label ${edgeOut.status}`}>{edgeOut.label}</div>
                      <div className={`edge-marker ${edgeOut.status}`}>
                        {edgeOut.status === 'invalid' ? <BrokenIcon /> : <CheckIcon />}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pending Edge to New Step */}
            <div className="edge-container">
              <div className="edge-line pending"></div>
            </div>

            {/* Add Step Action */}
            <div className="add-step-card" onClick={handleAddStep} role="button" tabIndex="0">
              {isChecking ? <span className="timestamp">Checking...</span> : <><PlusIcon /> Add next step</>}
            </div>
          </div>
        </section>

        {/* Transition Inspector */}
        <aside className="transition-inspector">
          {selectedEdgeData ? (
            <>
              <div className="inspector-header">
                <svg className="icon-invalid" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                <h3>{selectedEdgeData.inspectorData.title}</h3>
                <button className="icon-btn close-btn" onClick={() => setSelectedEdgeId(null)}>✕</button>
              </div>
              
              <p className="finding-text">{selectedEdgeData.inspectorData.finding}</p>

              {selectedEdgeData.inspectorData.realityCheck && (
                <div className="counterexample-card">
                  <h4>Reality check: try {selectedEdgeData.inspectorData.realityCheck.testValue}</h4>
                  <div className="calc-table">
                    <div className="calc-row">
                      <span className="calc-label">Original</span>
                      <MathDisplay math={selectedEdgeData.inspectorData.realityCheck.originalMath} className="calc-math" />
                      <span className="calc-result">= {selectedEdgeData.inspectorData.realityCheck.originalResult}</span>
                    </div>
                    <div className="calc-row">
                      <span className="calc-label">Your step</span>
                      <MathDisplay math={selectedEdgeData.inspectorData.realityCheck.stepMath} className="calc-math" />
                      <span className="calc-result">= {selectedEdgeData.inspectorData.realityCheck.stepResult}</span>
                    </div>
                  </div>
                  <p className="calc-note">Because the results differ, these expressions are not equivalent.</p>
                </div>
              )}

              <div className="inspector-actions">
                <button className="btn-outline">Give me a hint</button>
                <button className="btn-secondary">Explain why</button>
                <button className="btn-primary">Show repair</button>
              </div>
            </>
          ) : (
            <div className="inspector-empty">
              <p className="finding-text" style={{color: 'var(--muted)'}}>Select a transition to view its evidence.</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}