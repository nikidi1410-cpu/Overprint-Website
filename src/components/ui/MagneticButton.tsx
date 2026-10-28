"use client";

import { useRef, type ButtonHTMLAttributes } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { strength?: number };

export function MagneticButton({ strength = 0.3, className = "", children, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  useMagnetic(ref, strength);

  return (
    <button ref={ref} className={className} {...rest}>
      {children}
    </button>
  );
}
