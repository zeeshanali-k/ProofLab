import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathDisplay({ math, className = "math-display" }) {
  const containerRef = useRef(null);

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

  return <div ref={containerRef} className={className} role="math" aria-label={`Equation: ${math}`} />;
}
