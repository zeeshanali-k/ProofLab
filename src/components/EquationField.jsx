import { useEffect, useRef } from 'react';
import 'mathlive';

/** A small React wrapper around MathLive's accessible <math-field> element. */
export default function EquationField({ value, onChange, ariaLabel = 'Equation input' }) {
  const fieldRef = useRef(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return undefined;

    const handleInput = () => onChange(field.getValue('latex-expanded'));
    field.addEventListener('input', handleInput);
    return () => field.removeEventListener('input', handleInput);
  }, [onChange]);

  useEffect(() => {
    const field = fieldRef.current;
    if (field && field.getValue('latex-expanded') !== value) field.value = value;
  }, [value]);

  return (
    <math-field
      ref={fieldRef}
      className="equation-field"
      aria-label={ariaLabel}
      virtual-keyboard-mode="manual"
    >
      {value}
    </math-field>
  );
}
