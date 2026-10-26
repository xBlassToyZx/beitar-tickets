import { checkout } from "@/server/booking";
import { getBuyerId } from "@/server/buyer";
import { db } from "@/server/db";
import { handle } from "@/server/http";
import { checkoutSchema } from "@/server/schemas";

export const dynamic = "force-dynamic";

/** Simulated payment: converts the buyer's held seats into tickets. */
export async function POST(req: Request) {
  return handle(async () => {
    const { matchId } = checkoutSchema.parse(await req.json());
    return checkout(db, { buyerId: await getBuyerId(), matchId });
  });
}
