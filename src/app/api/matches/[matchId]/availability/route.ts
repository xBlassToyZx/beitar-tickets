import { getMatchAvailability } from "@/server/availability";
import { db } from "@/server/db";
import { handle } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  return handle(() => getMatchAvailability(db, matchId));
}
