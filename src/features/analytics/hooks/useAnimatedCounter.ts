/**
 * Animated Counter Hook
 * Animates numbers incrementally from 0 to final value
 * 
 * Usage:
 * const displayValue = useAnimatedCounter(12500, 2000);
 * 
 * Features:
 * - Configurable duration
 * - Smooth easing
 * - Formatted number output
 */

import { useEffect, useState } from 'react';

interface UseAnimatedCounterOptions {
  duration?: number;
  easing?: (t: number) => number;
}

/**
 * Easing function - ease-out-quad
 */
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function useAnimatedCounter(
  finalValue: number,
  { duration = 2000, easing = easeOutQuad }: UseAnimatedCounterOptions = {}
): number {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      setDisplayValue(Math.floor(finalValue * easedProgress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [finalValue, duration, easing]);

  return displayValue;
}
