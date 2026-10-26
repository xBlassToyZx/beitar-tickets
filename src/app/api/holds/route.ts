import { holdSeat, releaseSeat } from "@/server/booking";
import { getBuyerId } from "@/server/buyer";
import { db } from "@/server/db";
import { handle } from "@/server/http";
import { seatActionSchema } from "@/server/schemas";

export const dynamic = "force-dynamic";

/** Reserve a seat for the current buyer. */
export async function POST(req: Request) {
  return handle(async () => {
    const input = seatActionSchema.parse(await req.json());
    return holdSeat(db, { ...input, buyerId: await getBuyerId() });
  });
}

/** Release a seat the current buyer reserved. */
export async function DELETE(req: Request) {
  return handle(async () => {
    const input = seatActionSchema.parse(await req.json());
    await releaseSeat(db, { ...input, buyerId: await getBuyerId() });
  });
}
