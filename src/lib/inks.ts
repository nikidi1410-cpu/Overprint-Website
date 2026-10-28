// The studio's drum inventory. Hex values approximate the real Riso ink swatches.
export const INKS = {
  pink: { name: "Fluorescent pink", hex: "#FF48B0" },
  blue: { name: "Medium blue", hex: "#3255A4" },
  teal: { name: "Teal", hex: "#00838A" },
  yellow: { name: "Yellow", hex: "#FFE800" },
  red: { name: "Bright red", hex: "#F15060" },
} as const;

export type InkId = keyof typeof INKS;

export const INK_IDS = Object.keys(INKS) as InkId[];

export function isInkId(value: unknown): value is InkId {
  return typeof value === "string" && value in INKS;
}

export const LINE_MAX = 80;
export const SIGNATURE_MAX = 32;
