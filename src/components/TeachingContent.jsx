import { useEffect, useRef } from 'react';
import katex from 'katex';

function InlineMath({ expression }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) katex.render(expression.trim(), ref.current, { throwOnError: false, displayMode: false });
  }, [expression]);

  return <span ref={ref} className="inline-math" role="math" aria-label={`Equation: ${expression}`} />;
}

function DisplayMath({ expression }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) katex.render(expression.trim(), ref.current, { throwOnError: false, displayMode: true });
  }, [expression]);

  return <div ref={ref} className="teaching-display-math" role="math" aria-label={`Equation: ${expression}`} />;
}

const inlineToken = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\*\*[\s\S]*?\*\*)/;
const bareParenthesizedMath = /(\([^()\n]*[+\-*/^=<>][^()\n]*\)(?:\s*\^\s*(?:\{[^}]+\}|\d+))?)/g;

function renderPlainText(text, prefix) {
  const tokens = [];
  let cursor = 0;
  let match;
  let index = 0;

  while ((match = bareParenthesizedMath.exec(text)) !== null) {
    if (match.index > cursor) tokens.push(text.slice(cursor, match.index));
    tokens.push(<InlineMath key={`${prefix}-math-${index}`} expression={match[0]} />);
    cursor = match.index + match[0].length;
    index += 1;
  }
  if (cursor < text.length) tokens.push(text.slice(cursor));
  return tokens;
}

function renderInline(text, prefix) {
  const tokens = [];
  const matcher = new RegExp(inlineToken.source, 'g');
  let cursor = 0;
  let match;
  let index = 0;

  while ((match = matcher.exec(text)) !== null) {
    if (match.index > cursor) tokens.push(...renderPlainText(text.slice(cursor, match.index), `${prefix}-plain-${index}`));
    const token = match[0];
    const key = `${prefix}-${index}`;
    if (token.startsWith('$') && !token.startsWith('$$')) {
      tokens.push(<InlineMath key={key} expression={token.slice(1, -1)} />);
    } else if (token.startsWith('\\(')) {
      tokens.push(<InlineMath key={key} expression={token.slice(2, -2)} />);
    } else if (token.startsWith('**')) {
      tokens.push(<strong key={key}>{renderInline(token.slice(2, -2), `${key}-strong`)}</strong>);
    } else {
      tokens.push(token);
    }
    cursor = match.index + token.length;
    index += 1;
  }
  if (cursor < text.length) tokens.push(...renderPlainText(text.slice(cursor), `${prefix}-plain-end`));
  return tokens;
}

function renderBlock(block, index) {
  const trimmed = block.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
    return <DisplayMath key={`math-${index}`} expression={trimmed.slice(2, -2)} />;
  }

  const lines = trimmed.split('\n');
  const unordered = lines.every((line) => /^\s*[-*]\s+/.test(line));
  const ordered = lines.every((line) => /^\s*\d+\.\s+/.test(line));
  if (unordered || ordered) {
    const List = unordered ? 'ul' : 'ol';
    const marker = unordered ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/;
    return <List key={`list-${index}`}>{lines.map((line, lineIndex) => <li key={lineIndex}>{renderInline(line.replace(marker, ''), `list-${index}-${lineIndex}`)}</li>)}</List>;
  }

  return <p key={`paragraph-${index}`}>{lines.map((line, lineIndex) => <span key={lineIndex}>{lineIndex > 0 && <br />}{renderInline(line, `paragraph-${index}-${lineIndex}`)}</span>)}</p>;
}

/** Safely renders the limited Markdown and KaTeX syntax requested from teaching models. */
export default function TeachingContent({ content, className = '' }) {
  if (!content) return null;
  const blocks = String(content).replace(/\r\n/g, '\n').split(/\n\s*\n/);
  return <div className={`teaching-content ${className}`.trim()}>{blocks.map(renderBlock)}</div>;
}
