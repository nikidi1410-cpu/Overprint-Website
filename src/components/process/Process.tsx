"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

const STEPS = [
  {
    title: "Send us the file",
    body: "A PDF, a PNG, or a sketch on a napkin. We reply within a day and tell you honestly whether it will print.",
    place: "lg:col-start-1 lg:col-span-4",
  },
  {
    title: "We split it into inks",
    body: "Each colour becomes its own greyscale layer, and each layer is burned onto its own paper master.",
    place: "lg:col-start-7 lg:col-span-4 lg:mt-40",
  },
  {
    title: "One drum per pass",
    body: "The paper runs through once for every ink, up to 120 sheets a minute, with about two millimetres of wobble.",
    place: "lg:col-start-2 lg:col-span-4 lg:-mt-8",
  },
  {
    title: "Dry, trim, bind",
    body: "Soy ink needs a night to set. Then the guillotine, the long-arm stapler, and a box with your name on it.",
    place: "lg:col-start-8 lg:col-span-4 lg:mt-32",
  },
];

export function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const split = SplitText.create("[data-manifesto]", { type: "words", aria: "auto" });

      // Words go from a ghost impression to full ink as the paragraph scrolls past.
      gsap.fromTo(
        split.words,
        { opacity: 0.13 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: "[data-manifesto]", start: "top 78%", end: "bottom 42%", scrub: true },
        },
      );

      // The paper path through the machine draws itself with the scroll.
      gsap.fromTo(
        "[data-paper-path]",
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 60%", scrub: 0.6 },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
        gsap.from(step.querySelectorAll("[data-step-part]"), {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 82%" },
        });
      });

      // Parallax: each ink shape moves at its own speed.
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((shape) => {
        const speed = Number(shape.dataset.speed);
        gsap.to(shape, {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="process" className="relative overflow-hidden px-4 py-[16vh] sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div data-speed="-0.35" className="halftone absolute top-[2%] -left-[24vw] size-[38vw] rounded-full text-teal overprint [--dot:3px]" />
        <div data-speed="0.25" className="absolute top-[38%] -right-[8vw] h-[28vw] w-[56vw] rounded-t-full bg-yellow overprint" />
        <div data-speed="-0.15" className="halftone absolute -bottom-[12%] right-[5%] size-[16vw] rounded-full text-pink overprint [--dot:2.5px]" />
      </div>

      <div className="relative grid grid-cols-12 gap-x-6">
        <p
          data-manifesto
          className="col-span-12 font-serif text-[clamp(1.6rem,3.4vw,2.9rem)] leading-[1.22] [font-variation-settings:'opsz'_72] md:col-start-2 md:col-span-10 lg:col-start-3 lg:col-span-8"
        >
          A risograph is a stencil duplicator that dreams of being a press. It prints one colour at a
          time, fast and cheap and a little bit wrong. Inks overlap and make colours nobody mixed. Paper
          shifts and edges ghost. We stopped apologising for that years ago, and started designing for it.
        </p>
      </div>

      <div data-steps className="relative mt-[14vh] grid grid-cols-12 gap-x-6 gap-y-16">
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 -top-10 -bottom-10 hidden h-[calc(100%+5rem)] w-full lg:block"
        >
          <path
            data-paper-path
            d="M 46 0 C 43 10, 49 20, 46 32 S 43.5 52, 47 64 S 48.5 86, 45 100"
            pathLength={1}
            strokeDasharray="1"
            fill="none"
            stroke="var(--ink)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <h2 className="col-span-12 font-display text-display font-extrabold font-width-[60] lg:col-span-5">
          How a run works
        </h2>

        {STEPS.map((step, i) => (
          <article key={step.title} data-step className={`relative col-span-12 sm:col-span-8 ${step.place}`}>
            <div className="flex items-start gap-5">
              <span
                data-step-part
                className="font-display text-[5.5rem] leading-[0.8] font-black text-pink font-width-[50] overprint"
                aria-hidden
              >
                {i + 1}
              </span>
              <div>
                <h3 data-step-part className="font-display text-2xl leading-tight font-bold font-width-[110]">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p data-step-part className="mt-2 max-w-[38ch] text-ink-soft">
                  {step.body}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
