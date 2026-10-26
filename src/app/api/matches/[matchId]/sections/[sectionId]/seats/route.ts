import { getSectionSeatMap } from "@/server/availability";
import { getBuyerId } from "@/server/buyer";
import { db } from "@/server/db";
import { BookingError } from "@/server/errors";
import { handle } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string; sectionId: string }> },
) {
  const { matchId, sectionId } = await params;
  return handle(async () => {
    const map = await getSectionSeatMap(db, { matchId, sectionId, buyerId: await getBuyerId() });
    if (!map) throw new BookingError("SECTION_NOT_FOUND", "הגוש לא נמצא.");
    return map;
  });
}
