import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TeachingContent from '@/src/components/TeachingContent';

describe('TeachingContent', () => {
  it('renders model markdown and math syntax without showing raw delimiters', () => {
    const html = renderToStaticMarkup(
      <TeachingContent content={'**WHY THIS CHANGES**\nThe expression $ (x + 2)^2 $ needs the cross term $4x$.'} />,
    );

    expect(html).toContain('<strong>WHY THIS CHANGES</strong>');
    expect(html).not.toContain('**WHY THIS CHANGES**');
    expect(html).not.toContain('$ (x + 2)^2 $');
    expect(html).not.toContain('$4x$');
  });

  it('renders simple Markdown lists as semantic lists', () => {
    const html = renderToStaticMarkup(<TeachingContent content={'- Expand the brackets\n- Combine like terms'} />);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Expand the brackets</li>');
  });

  it('renders inline formula-bearing guidance without adding a block wrapper', () => {
    const html = renderToStaticMarkup(<TeachingContent inline content={'Use $F(x) = \\dots + C$.'} />);
    expect(html).toMatch(/^<span/);
    expect(html).not.toContain('$F(x) = \\dots + C$');
  });
});
