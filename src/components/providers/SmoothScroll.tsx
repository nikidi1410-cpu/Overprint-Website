"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type ScrollContextValue = {
  scrollTo: (target: string | number | HTMLElement, offset?: number) => void;
};

const ScrollContext = createContext<ScrollContextValue>({
  scrollTo: () => {},
});

export function useSmoothScroll() {
  return useContext(ScrollContext);
}

/**
 * Lenis drives the scroll position; GSAP's ticker drives Lenis. Sharing one
 * RAF loop keeps ScrollTrigger and the inertia scroll in lockstep.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.09,
      wheelMultiplier: 0.95,
      anchors: true,
    });

    const onTick = (time: number) => instance.raf(time * 1000);
    instance.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = instance;

    return () => {
      gsap.ticker.remove(onTick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback<ScrollContextValue["scrollTo"]>(
    (target, offset = 0) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { offset, duration: 1.4 });
        return;
      }
      if (typeof target === "number") {
        window.scrollTo({ top: target + offset });
        return;
      }
      const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset });
    },
    [],
  );

  const value = useMemo(() => ({ scrollTo }), [scrollTo]);
  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}
