"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { INKS } from "@/lib/inks";
import type { PrintDTO } from "@/lib/prints";

// Positions inside the top of the sheet, clear of the text below.
const SHAPES = [
  "-top-[30%] -right-[18%] aspect-square w-[78%] rounded-full",
  "-bottom-[60%] -left-[10%] aspect-square w-[120%] rounded-full",
  "top-[10%] left-[8%] h-[70%] w-[84%] -rotate-6",
  "-top-[20%] -left-[25%] aspect-square w-[80%] rounded-full",
];

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

type Props = {
  print: PrintDTO;
  fresh: boolean;
  onPull: (id: string) => void;
};

export function PosterCard({ print, fresh, onPull }: Props) {
  const ref = useRef<HTMLElement>(null);
  const seed = hash(print.id);
  const tilt = ((seed % 7) - 3) * 0.45;
  const size = print.line.length < 28 ? "text-[1.9rem]" : print.line.length < 52 ? "text-[1.45rem]" : "text-[1.15rem]";

  const pull = () => {
    onPull(print.id);
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A fresh sheet kicks the stack: a quick jolt and settle.
    gsap.fromTo(ref.current, { y: 0 }, { y: -10, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" });
    gsap.fromTo(ref.current.querySelector("[data-count]"), { scale: 1.6 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
  };

  return (
    <article
      ref={ref}
      className={`relative flex aspect-[3/4] flex-col overflow-hidden bg-[#f7f7f2] p-4 shadow-[6px_8px_0_var(--paper-shade)] ${fresh ? "animate-feed-in" : ""}`}
      style={{ rotate: `${tilt}deg` }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-[52%] overflow-hidden">
        <div
          className={`halftone absolute overprint [--dot:2.6px] ${SHAPES[seed % SHAPES.length]}`}
          style={{ color: INKS[print.ink].hex }}
        />
      </div>
      <p className={`relative mt-auto font-display leading-[1.02] font-bold font-width-[82] text-ink overprint ${size}`}>
        {print.line}
      </p>
      <p className="relative mt-3 font-serif text-sm text-ink-soft italic">
        {print.signedBy ? `Signed ${print.signedBy}` : "Unsigned"},{" "}
        <time dateTime={print.createdAt} suppressHydrationWarning>
          {timeAgo(print.createdAt)}
        </time>
      </p>
      <div className="relative mt-3 flex items-center justify-between gap-2 border-t border-ink/15 pt-3">
        <span className="font-display text-sm tabular-nums">
          <span data-count className="inline-block font-bold">
            {print.copies}
          </span>{" "}
          {print.copies === 1 ? "copy" : "copies"}
        </span>
        <button
          type="button"
          onClick={pull}
          data-cursor="Pull"
          className="rounded-full border border-ink px-3 py-1 font-display text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
        >
          Pull a copy
        </button>
      </div>
    </article>
  );
}
