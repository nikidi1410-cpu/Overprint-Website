"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { RegistrationMark } from "@/components/ui/RegistrationMark";
import { HalftoneField } from "./HalftoneField";

const LINES = [
  { text: "Two inks,", className: "font-width-[72]" },
  { text: "one pass,", className: "font-width-[112] pl-[9vw]" },
  { text: "no undo.", className: "font-width-[88] pl-[3vw]" },
];

const NAV = [
  { href: "#runs", label: "Recent runs" },
  { href: "#queue", label: "Print queue" },
  { href: "#contact", label: "Contact" },
];

function HeadlineLayer({
  ariaHidden,
  className,
  style,
}: {
  ariaHidden?: boolean;
  className: string;
  style?: CSSProperties;
}) {
  const Tag = ariaHidden ? "div" : "h1";
  return (
    <Tag aria-hidden={ariaHidden} className={className} style={style}>
      {LINES.map((line) => (
        <span key={line.text} className={`block overflow-hidden pt-[0.04em] pb-[0.08em] ${line.className}`}>
          <span data-line className="block">
            {line.text}
          </span>
        </span>
      ))}
    </Tag>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const plate = root.current!.querySelector<HTMLElement>("[data-plate]")!;

      if (reduced) {
        gsap.set("[data-reveal]", { autoAlpha: 1 });
        return;
      }

      let splits: SplitText[] = [];
      let cancelled = false;

      document.fonts.ready.then(() => {
        if (cancelled) return;
        splits = gsap.utils
          .toArray<HTMLElement>("[data-line]", root.current)
          .map((el) => SplitText.create(el, { type: "chars", aria: "none" }));
        const [pinkChars, blueChars] = [
          splits.slice(0, LINES.length).flatMap((s) => s.chars),
          splits.slice(LINES.length).flatMap((s) => s.chars),
        ];

        // Entrance: the pink plate prints first, the blue plate lands a beat
        // later from the opposite side, then both slide into register.
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.set("[data-reveal]", { autoAlpha: 1 })
          .from(pinkChars, { yPercent: 115, duration: 1.2, stagger: 0.028 }, 0)
          .from(blueChars, { yPercent: -115, duration: 1.2, stagger: 0.028 }, 0.16)
          .fromTo(plate, { "--reg-x": "64px", "--reg-y": "-28px" }, { "--reg-x": "6px", "--reg-y": "3px", duration: 1.8, ease: "power4.out" }, 0.3)
          .from("[data-intro]", { autoAlpha: 0, y: 24, duration: 1 }, 0.9)
          .fromTo("[data-hint] [data-draw]", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.15, ease: "power2.inOut" }, 1);

        // Leaving the hero: the plates drift apart as if the paper slipped.
        gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        })
          .to(plate, { "--reg-x": "38px", "--reg-y": "20px", yPercent: -18, ease: "none" }, 0)
          .to("[data-field]", { yPercent: 14, ease: "none" }, 0)
          .to("[data-hint] svg", { rotate: 270, ease: "none" }, 0)
          .to("[data-intro]", { autoAlpha: 0, y: -40, ease: "none" }, 0);

        ScrollTrigger.refresh();
      });

      return () => {
        cancelled = true;
        splits.forEach((s) => s.revert());
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative flex min-h-svh flex-col overflow-hidden">
      <div data-field className="absolute inset-0 -bottom-[15%]">
        <HalftoneField className="size-full overprint" />
      </div>

      <header className="relative z-10 flex items-start justify-between gap-6 px-4 pt-5 sm:px-8 sm:pt-7">
        <a href="#top" className="group block leading-none" aria-label="Overprint, back to top">
          <span className="relative inline-block font-display text-2xl font-extrabold font-width-[135] sm:text-3xl">
            <span aria-hidden className="absolute inset-0 translate-x-[2px] translate-y-[1.5px] text-pink overprint transition-transform duration-300 group-hover:translate-x-[5px]">
              Overprint
            </span>
            <span className="relative overprint">Overprint</span>
          </span>
          <span className="mt-1.5 block font-serif text-sm italic text-ink-soft">Risograph studio in Bandung</span>
        </a>
        <nav aria-label="Sections" className="hidden sm:block">
          <ul className="flex gap-7 font-display text-[0.95rem] font-medium">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(item.href);
                  }}
                  className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 ease-press hover:bg-[length:100%_2px]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 py-10 sm:px-8">
        <div
          data-plate
          data-reveal
          className="invisible relative font-display text-[14.5vw] leading-[0.82] font-extrabold sm:text-mega tracking-[-0.02em] [--reg-x:6px] [--reg-y:3px]"
        >
          <HeadlineLayer
            ariaHidden
            className="pointer-events-none absolute inset-0 text-pink overprint"
            style={{
              // Misregistration: a fixed slip plus a little drift with the pointer.
              transform: "translate3d(calc(var(--reg-x) + var(--mx) * -9px), calc(var(--reg-y) + var(--my) * -6px), 0)",
            }}
          />
          <HeadlineLayer className="relative text-blue overprint" />
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-12 items-end gap-x-6 gap-y-8 px-4 pb-6 sm:px-8 sm:pb-8">
        <p data-intro data-reveal className="invisible col-span-12 max-w-[34ch] text-lg leading-relaxed sm:col-span-6 lg:col-span-4">
          We print zines, posters and small books for artists, bands and anyone with a file and a deadline.
          Every colour is its own pass through the machine, so nothing lines up perfectly. We like it that way.
        </p>
        <button
          type="button"
          data-hint
          data-cursor="Scroll"
          onClick={() => scrollTo("#process")}
          className="col-span-12 flex items-center gap-4 justify-self-start text-left sm:col-span-6 sm:justify-self-end lg:col-start-10 lg:col-span-3"
        >
          <RegistrationMark className="size-14 shrink-0 text-ink" />
          <span className="font-display text-sm leading-snug font-medium">
            Scroll to see
            <br />
            how a run works
          </span>
        </button>
      </div>
    </section>
  );
}
