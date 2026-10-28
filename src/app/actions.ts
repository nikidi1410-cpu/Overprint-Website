"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { INK_IDS, LINE_MAX, SIGNATURE_MAX } from "@/lib/inks";
import { rateLimit } from "@/lib/rate-limit";
import type { PrintDTO } from "@/lib/prints";

const printSchema = z.object({
  line: z
    .string()
    .trim()
    .min(3, "Write at least three characters.")
    .max(LINE_MAX, `Keep it under ${LINE_MAX} characters so it fits the sheet.`),
  signedBy: z
    .string()
    .trim()
    .max(SIGNATURE_MAX, `Signatures are limited to ${SIGNATURE_MAX} characters.`)
    .transform((v) => (v.length ? v : null)),
  ink: z.enum(INK_IDS as [string, ...string[]], { message: "Pick one of the five inks." }),
});

export type SendToPressState =
  | { status: "idle" }
  | { status: "printed"; print: PrintDTO }
  | { status: "error"; message: string; field?: "line" | "signedBy" | "ink" };

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export async function sendToPress(
  _prev: SendToPressState,
  formData: FormData,
): Promise<SendToPressState> {
  const parsed = printSchema.safeParse({
    line: String(formData.get("line") ?? ""),
    signedBy: String(formData.get("signedBy") ?? ""),
    ink: String(formData.get("ink") ?? ""),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      status: "error",
      message: issue.message,
      field: issue.path[0] as "line" | "signedBy" | "ink",
    };
  }

  const limit = rateLimit(`press:${await clientKey()}`, 5, 60_000);
  if (!limit.ok) {
    const seconds = Math.ceil(limit.retryInMs / 1000);
    return {
      status: "error",
      message: `The drum needs a rest. Try again in ${seconds} seconds.`,
    };
  }

  let row;
  try {
    row = await prisma.print.create({ data: parsed.data });
  } catch (error) {
    console.error("sendToPress failed:", error);
    return { status: "error", message: "The press is offline right now. Try again later." };
  }

  return {
    status: "printed",
    print: {
      id: row.id,
      line: row.line,
      signedBy: row.signedBy,
      ink: parsed.data.ink as PrintDTO["ink"],
      copies: row.copies,
      createdAt: row.createdAt.toISOString(),
    },
  };
}

export async function pullCopy(id: string): Promise<{ copies: number } | { error: string }> {
  if (typeof id !== "string" || id.length > 40) return { error: "That print doesn't exist." };

  const limit = rateLimit(`pull:${await clientKey()}`, 30, 60_000);
  if (!limit.ok) return { error: "Slow down, the paper tray is empty." };

  try {
    const row = await prisma.print.update({
      where: { id },
      data: { copies: { increment: 1 } },
      select: { copies: true },
    });
    return { copies: row.copies };
  } catch {
    return { error: "That print doesn't exist." };
  }
}
