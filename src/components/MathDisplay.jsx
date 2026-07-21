'use client';
import { useEffect, useRef } from 'react';
import katex from 'katex';

export default function MathDisplay({ math, className = "math-display", inline = false, style = undefined }) {
  const containerRef = useRef(null);
  const Element = inline ? 'span' : 'div';

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          throwOnError: false,
          displayMode: false
        });
      } catch (error) {
        console.error("KaTeX error:", error);
        containerRef.current.textContent = math;
      }
    }
  }, [math]);

  return <Element ref={containerRef} className={className} style={style} role="math" aria-label={`Equation: ${math}`} />;
}
