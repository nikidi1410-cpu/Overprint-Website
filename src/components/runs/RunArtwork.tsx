import { useId, type ReactNode } from "react";
import { INKS } from "@/lib/inks";
import type { Run } from "@/lib/runs";

const W = 300;

type Layers = { a: ReactNode; b: ReactNode };

/**
 * Each composition is two plates. `screen` is a halftone fill in the
 * plate's ink, used for tints since a riso can't print a lighter ink.
 */
function compose(art: Run["art"], h: number, screen: (plate: "a" | "b") => string): Layers {
  switch (art) {
    case "lanterns":
      return {
        a: (
          <>
            {Array.from({ length: 12 }, (_, i) => (
              <circle key={i} cx={50 + (i % 3) * 100} cy={60 + Math.floor(i / 3) * 90} r={i % 4 === 1 ? 34 : 22} />
            ))}
          </>
        ),
        b: (
          <>
            <circle cx={190} cy={170} r={130} fill={screen("b")} />
            <rect x={0} y={h - 70} width={W} height={70} />
          </>
        ),
      };
    case "waves":
      return {
        a: (
          <>
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={0} y={18 + i * 32} width={W - (i % 3) * 70} height={14} />
            ))}
          </>
        ),
        b: (
          <>
            <path d={`M0 ${h * 0.55} C 70 ${h * 0.25}, 120 ${h * 0.85}, 190 ${h * 0.5} S 280 ${h * 0.3}, 300 ${h * 0.45} V ${h} H 0 Z`} fill={screen("b")} />
            <circle cx={235} cy={75} r={48} />
          </>
        ),
      };
    case "ferns":
      return {
        a: (
          <>
            {Array.from({ length: 14 }, (_, i) => (
              <ellipse
                key={i}
                cx={150 + (i % 2 ? 34 : -34)}
                cy={60 + i * 24}
                rx={52 - i * 2}
                ry={11}
                transform={`rotate(${i % 2 ? -28 : 28} ${150 + (i % 2 ? 34 : -34)} ${60 + i * 24})`}
              />
            ))}
            <rect x={148} y={40} width={4} height={h - 60} />
          </>
        ),
        b: (
          <>
            <rect x={24} y={24} width={W - 48} height={h - 48} fill={screen("b")} />
            <circle cx={64} cy={h - 70} r={26} />
          </>
        ),
      };
    case "sun":
      return {
        a: <circle cx={150} cy={h * 0.38} r={118} />,
        b: (
          <>
            <rect x={0} y={h * 0.52} width={W} height={h * 0.48} fill={screen("b")} />
            <text x={18} y={h - 34} fontSize={96} fontWeight={900} style={{ fontFamily: "var(--font-anybody)", fontVariationSettings: "'wdth' 58" }}>
              TOUR
            </text>
          </>
        ),
      };
    case "halves":
      return {
        a: (
          <>
            {Array.from({ length: 5 }, (_, i) => (
              <path key={i} d={`M 20 ${50 + i * 70} a 60 60 0 0 1 120 0 Z`} transform={`translate(${i % 2 ? 130 : 0} 0)`} />
            ))}
          </>
        ),
        b: (
          <>
            <circle cx={200} cy={130} r={95} fill={screen("b")} />
            <rect x={30} y={h - 90} width={180} height={50} />
          </>
        ),
      };
    case "map":
      return {
        a: (
          <>
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={`v${i}`} x={20 + i * 44} y={0} width={5} height={h} />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <rect key={`h${i}`} x={0} y={18 + i * 44} width={W} height={4} />
            ))}
            <rect x={110} y={66} width={80} height={60} fill={screen("a")} />
          </>
        ),
        b: (
          <path
            d={`M 10 ${h - 20} L 70 ${h - 80} L 70 120 L 160 120 L 200 40 L 290 30`}
            fill="none"
            stroke="currentColor"
            strokeWidth={10}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ),
      };
  }
}

export function RunArtwork({ run, className }: { run: Run; className?: string }) {
  const id = useId().replace(/:/g, "");
  const h = Math.round(W / run.ratio);
  const [inkA, inkB] = run.inks.map((ink) => INKS[ink].hex);
  const layers = compose(run.art, h, (plate) => `url(#${id}-dots-${plate})`);

  return (
    <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label={`${run.title}, printed in ${run.inks.map((i) => INKS[i].name.toLowerCase()).join(" and ")}`} className={className}>
      <defs>
        {(["a", "b"] as const).map((plate) => (
          <pattern key={plate} id={`${id}-dots-${plate}`} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <circle cx={3.5} cy={3.5} r={2.3} fill={plate === "a" ? inkA : inkB} />
          </pattern>
        ))}
      </defs>
      <rect width={W} height={h} fill="var(--paper)" />
      <g data-plate="a" fill={inkA} color={inkA} style={{ mixBlendMode: "multiply" }}>
        <g className="transition-transform duration-500 ease-press group-hover:-translate-x-[5px]">{layers.a}</g>
      </g>
      <g data-plate="b" fill={inkB} color={inkB} style={{ mixBlendMode: "multiply" }}>
        <g className="transition-transform duration-500 ease-press group-hover:translate-x-[7px] group-hover:translate-y-[4px]">{layers.b}</g>
      </g>
    </svg>
  );
}
