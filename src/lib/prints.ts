import "server-only";
import { prisma } from "@/lib/prisma";
import { INK_IDS, isInkId, type InkId } from "@/lib/inks";

export type PrintDTO = {
  id: string;
  line: string;
  signedBy: string | null;
  ink: InkId;
  copies: number;
  createdAt: string;
};

export type QueueStats = {
  sheets: number;
  prints: number;
  byInk: Record<InkId, number>;
};

export type QueueSnapshot = {
  prints: PrintDTO[];
  stats: QueueStats;
};

const PAGE_SIZE = 24;

function toDTO(row: {
  id: string;
  line: string;
  signedBy: string | null;
  ink: string;
  copies: number;
  createdAt: Date;
}): PrintDTO {
  return {
    id: row.id,
    line: row.line,
    signedBy: row.signedBy,
    ink: isInkId(row.ink) ? row.ink : "blue",
    copies: row.copies,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listPrints(ink?: InkId | null): Promise<PrintDTO[]> {
  const rows = await prisma.print.findMany({
    where: ink ? { ink } : undefined,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
  return rows.map(toDTO);
}

export async function getStats(): Promise<QueueStats> {
  const groups = await prisma.print.groupBy({
    by: ["ink"],
    _sum: { copies: true },
    _count: { _all: true },
  });

  const byInk = Object.fromEntries(INK_IDS.map((id) => [id, 0])) as Record<InkId, number>;
  let sheets = 0;
  let prints = 0;
  for (const g of groups) {
    const copies = g._sum.copies ?? 0;
    sheets += copies;
    prints += g._count._all;
    if (isInkId(g.ink)) byInk[g.ink] = copies;
  }
  return { sheets, prints, byInk };
}

export async function getSnapshot(ink?: InkId | null): Promise<QueueSnapshot> {
  const [prints, stats] = await Promise.all([listPrints(ink), getStats()]);
  return { prints, stats };
}
