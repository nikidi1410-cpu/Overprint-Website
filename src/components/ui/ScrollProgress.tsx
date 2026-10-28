"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

const SECTIONS = [
  { id: "top", label: "Start" },
  { id: "process", label: "How a run works" },
  { id: "runs", label: "Recent runs" },
  { id: "queue", label: "Print queue" },
  { id: "contact", label: "Contact" },
];

/**
 * A paper-feed gauge down the right edge: it fills as you read, and each
 * notch jumps to a section.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<number[]>([]);
  const [active, setActive] = useState("top");
  const { scrollTo } = useSmoothScroll();

  useGSAP(() => {
    gsap.to(bar.current, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });

    SECTIONS.forEach(({ id }) => {
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => self.isActive && setActive(id),
      });
    });
  });

  useEffect(() => {
    // Notch positions are proportional to where each section starts.
    const measure = () => {
      const max = ScrollTrigger.maxScroll(window) || 1;
      setMarks(
        SECTIONS.map(({ id }) => {
          const el = document.getElementById(id);
          if (!el) return 0;
          return Math.min(1, (el.getBoundingClientRect().top + window.scrollY) / max);
        }),
      );
    };
    ScrollTrigger.addEventListener("refresh", measure);
    measure();
    return () => ScrollTrigger.removeEventListener("refresh", measure);
  }, []);

  return (
    <nav aria-label="Page progress" className="fixed top-1/2 right-2 z-[80] h-[56vh] -translate-y-1/2 sm:right-4">
      <div className="relative h-full w-[3px] bg-ink/15">
        <div ref={bar} className="absolute inset-0 origin-top scale-y-0 bg-blue" />
        {marks.length === SECTIONS.length &&
          SECTIONS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(`#${s.id}`)}
              aria-label={s.label}
              aria-current={active === s.id ? "location" : undefined}
              className="group absolute left-1/2 hidden -translate-x-1/2 -translate-y-1/2 p-2 sm:block"
              style={{ top: `${marks[i] * 100}%` }}
            >
              <span
                className={`block size-2.5 rounded-full border-2 border-blue transition-colors ${active === s.id ? "bg-blue" : "bg-paper"}`}
              />
              <span className="pointer-events-none absolute top-1/2 right-6 -translate-y-1/2 translate-x-2 rounded-full bg-ink px-2.5 py-1 font-display text-xs whitespace-nowrap text-paper opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                {s.label}
              </span>
            </button>
          ))}
      </div>
    </nav>
  );
}
