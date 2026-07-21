import MathDisplay from './MathDisplay';

function operatorFor(region) {
  if (region.direction === 'left') return region.inclusive ? '\\le' : '<';
  return region.inclusive ? '\\ge' : '>';
}

function NumberLineSimulation({ region, phase }) {
  if (!region) return <p className="simulation-empty">Enter a complete inequality to preview your number line.</p>;
  const endpoint = 50;
  const left = region.direction === 'left';
  const label = `Your solution region x ${operatorFor(region)} ${region.boundaryLatex}`;
  return (
    <div className={`simulation-number-line ${phase}`}>
      <svg viewBox="0 0 100 48" role="img" aria-label={label}>
        <line className="simulation-axis" x1="6" y1="24" x2="94" y2="24" />
        <line className="simulation-ray" x1={left ? 8 : endpoint} y1="24" x2={left ? endpoint : 92} y2="24" />
        <circle className={region.inclusive ? 'simulation-endpoint closed' : 'simulation-endpoint open'} cx={endpoint} cy="24" r="5" />
      </svg>
      <MathDisplay math={`x ${operatorFor(region)} ${region.boundaryLatex}`} className="simulation-caption" />
    </div>
  );
}

function ComplexPlaneSimulation({ points, phase }) {
  if (!points?.length) return <p className="simulation-empty">Enter a braced solution set to preview your complex points.</p>;
  const extent = Math.max(3, ...points.flatMap((point) => [Math.abs(point.real), Math.abs(point.imaginary)])) + 1;
  const coordinate = (value) => 50 + (value / extent) * 38;
  return (
    <div className={`simulation-complex-plane ${phase}`}>
      <svg viewBox="0 0 100 100" role="img" aria-label="Your submitted complex points">
        <line className="simulation-axis" x1="8" y1="50" x2="92" y2="50" />
        <line className="simulation-axis" x1="50" y1="8" x2="50" y2="92" />
        <text x="89" y="46">Re</text><text x="53" y="13">Im</text>
        {points.map((point, index) => <g key={`${point.label}-${index}`}>
          <circle className="complex-point" cx={coordinate(point.real)} cy={coordinate(-point.imaginary)} r="4" />
        </g>)}
      </svg>
      {points.map((point, index) => <MathDisplay key={`${point.label}-${index}`} math={point.label} inline className="complex-point-math-label" style={{ left: `${coordinate(point.real) + 4}%`, top: `${coordinate(-point.imaginary) - 4}%` }} />)}
    </div>
  );
}

export default function MathSimulationPanel({ visualization }) {
  const type = visualization?.type ?? 'none';
  const phase = visualization?.phase ?? 'draft';
  const learnerData = visualization?.learnerData ?? {};
  return (
    <section className={`math-simulation-panel ${phase}`} aria-label="Reality simulator">
      <div className="simulation-heading"><span className="panel-eyebrow">REALITY SIMULATOR</span>{phase === 'accepted' && <span className="simulation-verified">Verified</span>}</div>
      {type === 'number-line' && <NumberLineSimulation region={learnerData.region} phase={phase} />}
      {type === 'complex-plane' && <ComplexPlaneSimulation points={learnerData.points} phase={phase} />}
      {type === 'none' && <p className="simulation-empty">This challenge is checked symbolically after your final submission.</p>}
    </section>
  );
}
