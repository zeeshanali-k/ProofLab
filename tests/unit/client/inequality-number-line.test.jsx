import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import InequalityNumberLine from '@/src/components/InequalityNumberLine';

const signFlipEvidence = {
  kind: 'inequality-region',
  previousRegion: { boundaryLatex: '-2', direction: 'left', inclusive: false },
  submittedRegion: { boundaryLatex: '-2', direction: 'right', inclusive: false },
  testValueLatex: '0',
  previousIncludesTest: false,
  submittedIncludesTest: true,
  numberLine: { previousBoundaryPosition: 35, submittedBoundaryPosition: 35, testValuePosition: 75 },
};

describe('InequalityNumberLine', () => {
  it('renders both server-supplied regions and the differentiating reality check', () => {
    const html = renderToStaticMarkup(<InequalityNumberLine evidence={signFlipEvidence} isValid={false} />);

    expect(html).toContain('Compare the solution regions');
    expect(html).toContain('Correct region');
    expect(html).toContain('Your region');
    expect(html).toContain('Reality check:');
    expect(html).toContain('does not accept it; your region accepts it.');
    expect(html).toContain('Correct solution region');
  });

  it('collapses matching regions to one verified mint ray', () => {
    const html = renderToStaticMarkup(<InequalityNumberLine evidence={signFlipEvidence} isValid />);

    expect(html).toContain('Verified solution region');
    expect(html).toContain('Verified region');
    expect(html).not.toContain('Correct region');
  });
});
