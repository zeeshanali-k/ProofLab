import MathDisplay from './MathDisplay';

const operatorFor = (region) => {
  if (region.direction === 'left') return region.inclusive ? '\\le' : '<';
  return region.inclusive ? '\\ge' : '>';
};

const regionLatex = (region) => `x ${operatorFor(region)} ${region.boundaryLatex}`;

function RegionRay({ region, position, tone, y }) {
  const start = region.direction === 'left' ? 5 : position;
  const end = region.direction === 'left' ? position : 95;
  return (
    <g className={`number-line-ray ${tone}`}>
      <line x1={start} y1={y} x2={end} y2={y} />
      <circle cx={position} cy={y} r="5" className={region.inclusive ? 'closed-endpoint' : 'open-endpoint'} />
    </g>
  );
}

export default function InequalityNumberLine({ evidence, isValid }) {
  const previous = evidence.previousRegion;
  const submitted = evidence.submittedRegion;
  const line = evidence.numberLine;
  const previousLatex = regionLatex(previous);
  const submittedLatex = regionLatex(submitted);
  const previousMembership = evidence.previousIncludesTest ? 'accepts' : 'does not accept';
  const submittedMembership = evidence.submittedIncludesTest ? 'accepts' : 'does not accept';
  const description = isValid
    ? `Verified solution region ${submittedLatex}. At x = ${evidence.testValueLatex}, the region ${submittedMembership} the value.`
    : `Correct solution region ${previousLatex}; submitted solution region ${submittedLatex}. At x = ${evidence.testValueLatex}, the correct region ${previousMembership} the value and the submitted region ${submittedMembership} it.`;

  return (
    <section className={`number-line-card ${isValid ? 'is-valid' : 'is-invalid'}`} aria-label="Number line evidence">
      <h3>{isValid ? 'Verified solution region' : 'Compare the solution regions'}</h3>
      <svg viewBox="0 0 100 72" role="img" aria-label={description} className="inequality-number-line">
        <line className="number-line-axis" x1="5" y1="36" x2="95" y2="36" />
        {isValid ? (
          <RegionRay region={submitted} position={line.submittedBoundaryPosition} tone="valid" y={36} />
        ) : (
          <>
            <RegionRay region={previous} position={line.previousBoundaryPosition} tone="valid" y={29} />
            <RegionRay region={submitted} position={line.submittedBoundaryPosition} tone="invalid" y={43} />
          </>
        )}
        <line className="test-value-guide" x1={line.testValuePosition} y1="12" x2={line.testValuePosition} y2="60" />
        <circle className="test-value-dot" cx={line.testValuePosition} cy="36" r="3" />
      </svg>
      <div className="number-line-regions">
        {!isValid && <div><span className="region-key valid" /> Correct region <MathDisplay math={previousLatex} className="inline-evidence-math" inline /></div>}
        <div><span className={`region-key ${isValid ? 'valid' : 'invalid'}`} /> {isValid ? 'Verified region' : 'Your region'} <MathDisplay math={submittedLatex} className="inline-evidence-math" inline /></div>
      </div>
      <div className="number-line-reality-check">
        <strong>Reality check:</strong>
        <MathDisplay math={`x = ${evidence.testValueLatex}`} className="inline-evidence-math" inline />
        {isValid
          ? <span>This region {submittedMembership} this value.</span>
          : <span>The correct region {previousMembership} it; your region {submittedMembership} it.</span>}
      </div>
    </section>
  );
}
