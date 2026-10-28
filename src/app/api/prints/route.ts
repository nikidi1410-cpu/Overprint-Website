import type { NextRequest } from "next/server";
import { isInkId } from "@/lib/inks";
import { getSnapshot } from "@/lib/prints";

// Polled by the print queue every few seconds. Reading the query string makes
// this handler run at request time.
export async function GET(request: NextRequest) {
  const inkParam = request.nextUrl.searchParams.get("ink");
  const ink = isInkId(inkParam) ? inkParam : null;

  const snapshot = await getSnapshot(ink);
  return Response.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
}
