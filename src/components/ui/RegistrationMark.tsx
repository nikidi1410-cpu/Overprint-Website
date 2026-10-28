import type { SVGProps } from "react";

/** The crosshair-in-a-circle printers use to line up colour layers. */
export function RegistrationMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle data-draw cx="32" cy="32" r="18" pathLength={1} />
      <circle data-draw cx="32" cy="32" r="9" pathLength={1} />
      <path data-draw d="M32 2v60M2 32h60" pathLength={1} />
    </svg>
  );
}
