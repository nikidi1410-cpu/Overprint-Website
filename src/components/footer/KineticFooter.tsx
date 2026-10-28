"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

const LINES = ["Bring us", "your file."];
const REACH = 260;

function Letters({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          data-char
          className="inline-block [font-variation-settings:'wdth'_var(--w,100),'wght'_var(--g,800)] will-change-[font-variation-settings]"
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </>
  );
}

export function KineticFooter() {
  const wrapper = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLElement>(null);
  const mail = useRef<HTMLAnchorElement>(null);
  const { scrollTo } = useSmoothScroll();
  useMagnetic(mail, 0.4);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Both plates carry the same letters; index i and i + n are the same glyph.
      const all = gsap.utils.toArray<HTMLElement>("[data-plate] [data-char]", footer.current);
      const n = all.length / 2;
      const chars = all.slice(n);
      const plate = footer.current!.querySelector<HTMLElement>("[data-plate]")!;

      // Reveal: letters stretch open as the curtain lifts, and the yellow
      // plate slides into register when the page bottoms out.
      gsap
        .timeline({
          scrollTrigger: { trigger: wrapper.current, start: "top bottom", end: "bottom bottom", scrub: 0.5 },
        })
        .fromTo(all, { "--w": 50, "--g": 300, yPercent: 40 }, { "--w": 100, "--g": 800, yPercent: 0, stagger: (i) => (i % n) * 0.03, ease: "power2.out" }, 0)
        .fromTo(plate, { "--slip-x": "48px", "--slip-y": "-30px" }, { "--slip-x": "5px", "--slip-y": "4px", ease: "power3.inOut" }, 0);

      // Interactive type: letters near the pointer widen and gain weight.
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const setters = chars.map((c, i) => {
        const pair = [c, all[i]];
        return {
          w: gsap.quickTo(pair, "--w", { duration: 0.6, ease: "power3.out" }),
          g: gsap.quickTo(pair, "--g", { duration: 0.6, ease: "power3.out" }),
        };
      });
      let centres: { x: number; y: number }[] = [];
      const measure = () => {
        centres = chars.map((c) => {
          const r = c.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });
      };

      // Last proximity per letter; letters whose target barely moved are skipped
      // so only the ones near the pointer trigger re-layout.
      const last = chars.map(() => -1);
      const onMove = (e: PointerEvent) => {
        if (!centres.length) measure();
        centres.forEach((c, i) => {
          const d = Math.hypot(e.clientX - c.x, (e.clientY - c.y) * 1.6);
          const p = Math.max(0, 1 - d / REACH);
          if (Math.abs(p - last[i]) < 0.02) return;
          last[i] = p;
          setters[i].w(85 + 65 * p);
          setters[i].g(600 + 300 * p);
        });
      };
      const onLeave = () => {
        last.fill(-1);
        setters.forEach((s) => (s.w(100), s.g(800)));
      };

      const el = footer.current!;
      el.addEventListener("pointerenter", measure);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", measure);
      return () => {
        el.removeEventListener("pointerenter", measure);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("resize", measure);
      };
    },
    { scope: footer },
  );

  return (
    // The clip-path keeps the fixed footer hidden until the page above scrolls off it.
    <div
      ref={wrapper}
      id="contact"
      className="relative h-svh"
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
    >
      <footer
        ref={footer}
        className="fixed bottom-0 left-0 flex h-svh w-full flex-col justify-between bg-pink px-4 pt-6 pb-5 text-ink sm:px-8 sm:pt-8"
      >
        <p className="max-w-[40ch] text-lg">
          Quotes go out within a day. Short runs start at 30 copies, and we&apos;re always happy to look
          at a file before you commit to anything.
        </p>

        <div
          data-plate
          className="relative [contain:layout_paint] font-display text-[17vw] leading-[0.86] sm:text-mega [--slip-x:5px] [--slip-y:4px]"
        >
          <p
            aria-hidden
            className="pointer-events-none absolute inset-0 text-yellow overprint"
            style={{ transform: "translate3d(var(--slip-x), var(--slip-y), 0)" }}
          >
            {LINES.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                <Letters text={line} />
              </span>
            ))}
          </p>
          <h2 data-headline className="relative text-ink">
            {LINES.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                <Letters text={line} />
              </span>
            ))}
          </h2>
        </div>

        <div className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-5">
            <a
              ref={mail}
              href="mailto:hello@overprint.studio"
              data-cursor="Write"
              className="inline-block rounded-full bg-ink px-7 py-4 font-display text-xl font-semibold text-paper sm:text-2xl"
            >
              hello@overprint.studio
            </a>
          </div>
          <address className="col-span-7 text-base not-italic sm:col-span-4 lg:col-span-4">
            Studio on Jl. Cihapit, Bandung
            <br />
            Open Tuesday to Saturday, 10:00 to 18:00
          </address>
          <div className="col-span-5 justify-self-end text-right sm:col-span-2 lg:col-span-3">
            <button
              type="button"
              onClick={() => scrollTo(0)}
              className="font-display font-semibold underline decoration-2 underline-offset-4 hover:decoration-wavy"
            >
              Back to the top
            </button>
            <p className="mt-2 text-sm">© 2026 Overprint</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
