import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GuideScreen from '@/src/components/GuideScreen';

describe('GuideScreen', () => {
  const html = renderToStaticMarkup(<GuideScreen onClose={() => {}} />);

  it('renders a navigable, solution-free reference for each platform area', () => {
    expect(html).toContain('Use the ProofLab visualizer with confidence.');
    expect(html).toContain('Guide sections');
    expect(html).toContain('What ProofLab does');
    expect(html).toContain('Choose, start, or reset a problem');
    expect(html).toContain('Read the visualizer from left to right');
    expect(html).toContain('Add, check, edit, and remove steps');
    expect(html).toContain('Understand the colors, labels, and evidence');
    expect(html).toContain('Use coaching after you inspect evidence');
    expect(html).toContain('Track progress and canonical completion');
    expect(html).toContain('Use the action that matches the current mode');
    expect(html).toContain('Know what ProofLab can check');
    expect(html).not.toContain('x²');
  });

  it('documents the visual feedback states and complex-solving controls', () => {
    expect(html).toContain('Checked');
    expect(html).toContain('Needs repair');
    expect(html).toContain('Needs rechecking');
    expect(html).toContain('Add equivalent step / Submit solution set');
    expect(html).toContain('Apply and check always verifies that draft');
  });
});
