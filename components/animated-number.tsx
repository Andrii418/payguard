"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({ value, decimals = 2, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    // Animujemy od ostatnio pokazanej wartości, więc przy zmianie danych liczba "dopływa" płynnie.
    const controls = animate(previous.current, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        previous.current = v;
        setDisplay(v);
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      {display.toLocaleString("pl-PL", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}