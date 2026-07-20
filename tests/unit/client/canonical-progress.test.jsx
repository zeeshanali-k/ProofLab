import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CanonicalProgress from '@/src/components/CanonicalProgress';

describe('CanonicalProgress', () => {
  it('shows the compact canonical completion states', () => {
    expect(renderToStaticMarkup(<CanonicalProgress status="complete" onReveal={() => {}} />)).toContain('Complete');
    expect(renderToStaticMarkup(<CanonicalProgress status="in-progress" onReveal={() => {}} />)).toContain('In progress');
    expect(renderToStaticMarkup(<CanonicalProgress status="needs-correction" onReveal={() => {}} />)).toContain('Needs correction');
  });

  it('only renders a final-form result after a canonical reveal response', () => {
    const hidden = renderToStaticMarkup(<CanonicalProgress status="in-progress" onReveal={() => {}} />);
    const revealed = renderToStaticMarkup(<CanonicalProgress status="in-progress" onReveal={() => {}} revealedFinalForm="f'(x) = 2x" />);

    expect(hidden).toContain('Reveal final form');
    expect(hidden).not.toContain('Canonical form');
    expect(revealed).toContain('Canonical form');
    expect(revealed).toContain('f');
  });
});
