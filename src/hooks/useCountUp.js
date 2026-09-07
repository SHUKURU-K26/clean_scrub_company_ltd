import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Animates a number counting up to `target` on mount or whenever target
// changes — used for stat cards and the health ring so numbers feel alive
// instead of just appearing. Respects prefers-reduced-motion by skipping
// straight to the final value.
export function useCountUp(target, { duration = 900 } = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(reducedMotion ? target : 0);
  const frameRef = useRef();
  const fromRef = useRef(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }

    fromRef.current = value;
    startRef.current = null;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, reducedMotion]);

  return Math.round(value);
}