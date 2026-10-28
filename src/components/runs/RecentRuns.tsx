"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { INKS } from "@/lib/inks";
import { RUNS } from "@/lib/runs";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { RunArtwork } from "./RunArtwork";

export function RecentRuns() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(1);
  const { scrollTo } = useSmoothScroll();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;

        // Vertical scroll drives the track sideways while the section is pinned.
        const slide = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            pin: "[data-pin]",
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              gsap.set("[data-feed]", { scaleX: self.progress });
              const next = Math.min(RUNS.length, Math.max(1, Math.round(self.progress * (RUNS.length - 1)) + 1));
              setCurrent((prev) => (prev === next ? prev : next));
            },
          },
        });

        // Each card prints as it slides in: plate A lands, then plate B, slightly off register.
        gsap.utils.toArray<HTMLElement>("[data-run]").forEach((card) => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              containerAnimation: slide,
              start: "left 92%",
              toggleActions: "play none none reverse",
            },
          });
          tl.from(card.querySelector("[data-plate='a']"), { x: -40, opacity: 0, duration: 0.7, ease: "power3.out" })
            .from(card.querySelector("[data-plate='b']"), { x: 50, y: -16, opacity: 0, duration: 0.8, ease: "power3.out" }, 0.15)
            .from(card.querySelectorAll("[data-caption] > *"), { y: 18, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: "power2.out" }, 0.3);
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="runs" aria-labelledby="runs-title" className="relative bg-ink text-paper">
      <div data-pin className="relative flex h-svh flex-col overflow-hidden motion-reduce:h-auto motion-reduce:py-20">
        <div
          ref={track}
          className="flex h-full flex-1 items-stretch gap-[7vw] pr-[12vw] pl-4 will-change-transform motion-reduce:snap-x motion-reduce:overflow-x-auto sm:pl-8"
        >
          <div className="flex w-[min(82vw,28rem)] shrink-0 flex-col justify-center">
            <h2 id="runs-title" className="font-display text-display font-extrabold font-width-[130]">
              Recent runs
            </h2>
            <p className="mt-6 max-w-[34ch] text-lg text-paper/80">
              Six jobs from the past year. All of them came off the same machine, a 2009 MZ970 we call
              Bu Ratna, who jams whenever it rains.
            </p>
          </div>

          {RUNS.map((run) => (
            <article
              key={run.slug}
              data-run
              className={`group flex shrink-0 snap-center flex-col items-start ${run.align}`}
            >
              <div
                className="isolate shadow-[10px_12px_0_rgba(0,0,0,0.22)]"
                style={{ aspectRatio: run.ratio, height: `min(${run.height}vh, ${Math.round(78 / run.ratio)}vw)` }}
              >
                <RunArtwork run={run} className="block size-full" />
              </div>
              <div data-caption className="mt-4 max-w-[min(30ch,100%)]">
                <h3 className="font-display text-xl leading-tight font-bold font-width-[105]">{run.title}</h3>
                <p className="mt-1 text-sm text-paper/75">
                  {run.format} for {run.client}. Edition of {run.edition.toLocaleString("en")} on {run.paper}.
                </p>
                <ul className="mt-2 flex gap-3 text-xs text-paper/75" aria-label="Inks">
                  {run.inks.map((ink) => (
                    <li key={ink} className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={{ background: INKS[ink].hex }} />
                      {INKS[ink].name}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}

          <div className="flex w-[min(80vw,24rem)] shrink-0 flex-col justify-center">
            <p className="font-display text-3xl leading-tight font-bold font-width-[90]">
              Got something that needs two colours and a deadline?
            </p>
            <button
              type="button"
              onClick={() => scrollTo("#contact")}
              className="mt-6 self-start rounded-full bg-yellow px-6 py-3 font-display font-semibold text-ink transition-transform duration-300 ease-press hover:-rotate-2"
            >
              Ask for a quote
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5 px-4 pb-6 sm:px-8 motion-reduce:hidden" aria-hidden>
          <span className="w-20 font-display text-sm tabular-nums">
            Run {current} of {RUNS.length}
          </span>
          <span className="relative h-[3px] flex-1 bg-paper/20">
            <span data-feed className="absolute inset-0 origin-left scale-x-0 bg-pink" />
          </span>
        </div>
      </div>
    </section>
  );
}
