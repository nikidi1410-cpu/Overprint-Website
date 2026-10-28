"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useMediaQuery, useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * A blot of pink ink that trails the pointer and swells over anything
 * clickable. Elements can set data-cursor="Label" to print a word inside it.
 * Also publishes the pointer position as --mx / --my (-1..1) on <html>.
 */
export function InkCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled || !dotRef.current) return;
    const dot = dotRef.current;
    const root = document.documentElement;
    root.classList.add("has-ink-cursor");

    const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3.out" });
    let current: Element | null = null;
    gsap.set(dot, { scale: 0.19 });

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      root.style.setProperty("--mx", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      root.style.setProperty("--my", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));

      const target = (e.target as Element | null)?.closest("a, button, label, [data-cursor]") ?? null;
      if (target === current) return;
      current = target;
      const text = target?.getAttribute("data-cursor") ?? "";
      setLabel(text);
      gsap.to(dot, {
        scale: target ? (text ? 1 : 0.6) : 0.19,
        duration: 0.45,
        ease: "elastic.out(1, 0.6)",
      });
    };

    const onLeave = () => gsap.to(dot, { opacity: 0, duration: 0.2 });
    const onEnter = () => gsap.to(dot, { opacity: 1, duration: 0.2 });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      root.classList.remove("has-ink-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] -mt-8 -ml-8 grid size-16 place-items-center rounded-full bg-pink overprint"
    >
      <span className="font-display text-[11px] leading-none font-semibold whitespace-nowrap text-ink">
        {label}
      </span>
    </div>
  );
}
