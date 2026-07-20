import MathDisplay from './MathDisplay';

const STATUS_COPY = {
  complete: 'Complete',
  'in-progress': 'In progress',
  'needs-correction': 'Needs correction',
};

export default function CanonicalProgress({ status = 'in-progress', onReveal, isRevealing, revealedFinalForm }) {
  const label = STATUS_COPY[status] ?? STATUS_COPY['in-progress'];
  return (
    <div className="canonical-progress" aria-label={`Canonical progress: ${label}`}>
      <span className={`canonical-status ${status}`}>{label}</span>
      <button className="reveal-final-form" onClick={onReveal} disabled={isRevealing}>
        {isRevealing ? 'Revealing…' : 'Reveal final form'}
      </button>
      {revealedFinalForm && <div className="revealed-final-form"><span>Canonical form</span><MathDisplay math={revealedFinalForm} /></div>}
    </div>
  );
}
