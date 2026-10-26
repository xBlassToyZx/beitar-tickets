import { getBuyerId } from "@/server/buyer";
import { db } from "@/server/db";
import { handle } from "@/server/http";
import { seasonPurchaseSchema } from "@/server/schemas";
import { purchaseSeasonTicket } from "@/server/season";

export const dynamic = "force-dynamic";

/** Simulated payment: buys a season ticket in the chosen plan. */
export async function POST(req: Request) {
  return handle(async () => {
    const { planId } = seasonPurchaseSchema.parse(await req.json());
    return purchaseSeasonTicket(db, { buyerId: await getBuyerId(), planId });
  });
}
