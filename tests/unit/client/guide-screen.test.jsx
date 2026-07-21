import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GuideScreen from '@/src/components/GuideScreen';

describe('GuideScreen', () => {
  const mathHtml = renderToStaticMarkup(<GuideScreen initialTab="math" />);
  const chemistryHtml = renderToStaticMarkup(<GuideScreen initialTab="chemistry" />);
  const physicsHtml = renderToStaticMarkup(<GuideScreen initialTab="physics" />);
  const biologyHtml = renderToStaticMarkup(<GuideScreen initialTab="biology" />);

  it('restores the comprehensive Math Lab guide inside a dedicated tab', () => {
    expect(mathHtml).toContain('Use Math Lab in three ways');
    expect(mathHtml).toContain('Build Math Foundations with visual practice');
    expect(mathHtml).toContain('Choose, start, or reset a problem');
    expect(mathHtml).toContain('Read the visualizer from left to right');
    expect(mathHtml).toContain('Add, check, edit, and remove steps');
    expect(mathHtml).toContain('Understand the colors, labels, and evidence');
    expect(mathHtml).toContain('Use coaching after you inspect evidence');
    expect(mathHtml).toContain('Track progress and canonical completion');
    expect(mathHtml).toContain('Use the action that matches the current mode');
    expect(mathHtml).toContain('Know what Math Lab can check and save');
    expect(mathHtml).toContain('Math Foundations');
    expect(mathHtml).toContain('Add equivalent step / Submit solution set');
    expect(mathHtml).toContain('aria-current="location"');
    expect(mathHtml).toContain('class="is-active"');
  });

  it('provides a dedicated, detailed tab for every science lab', () => {
    expect(mathHtml).toContain('role="tablist"');
    expect(mathHtml).toContain('Math Lab');
    expect(mathHtml).toContain('Chemistry Lab');
    expect(mathHtml).toContain('Physics Lab');
    expect(mathHtml).toContain('Biology Lab');

    expect(chemistryHtml).toContain('Use Chemistry Lab with confidence.');
    expect(chemistryHtml).toContain('Balance equations and inspect composition');
    expect(chemistryHtml).toContain('Inspect molecules in three dimensions');
    expect(chemistryHtml).toContain('Know what Chemistry Lab is for');

    expect(physicsHtml).toContain('Use Physics Lab with confidence.');
    expect(physicsHtml).toContain('Start with the Formula Visualizer');
    expect(physicsHtml).toContain('Explore motion over time');
    expect(physicsHtml).toContain('Know what Physics Lab models');

    expect(biologyHtml).toContain('Use Biology Lab with confidence.');
    expect(biologyHtml).toContain('Use body views to connect structures and systems');
    expect(biologyHtml).toContain('Follow traits from chromosomes to offspring');
    expect(biologyHtml).toContain('Know what Biology Lab represents');
  });
});
